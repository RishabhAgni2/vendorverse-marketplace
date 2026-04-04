const mongoose = require('mongoose')
const { validationResult } = require('express-validator')
const { Product } = require('../models/Product')
const { Vendor } = require('../models/Vendor')
const { Order, ORDER_STATUS } = require('../models/Order')
const { HttpError } = require('../utils/httpError')

function getCommissionRate() {
  const raw = process.env.COMMISSION_RATE
  const rate = raw === undefined ? 0 : Number(raw)
  if (Number.isNaN(rate) || rate < 0 || rate > 1) return 0.1
  return rate
}

function isReplicaSetTransactionError(err) {
  const msg = String(err?.message || '')
  return msg.includes('Transaction numbers are only allowed on a replica set member or mongos')
}

async function checkout(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const { items, shippingAddress } = req.body
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Cart is empty')

  const commissionRate = getCommissionRate()

  async function run({ session }) {
    const buyerVendor = await Vendor.findOne({ user: req.user._id }).session(session || null)
    const decremented = []
    try {
      const orderItems = []
      let subtotal = 0

      for (const item of items) {
        const productId = item?.productId
        const qty = Number(item?.qty)
        if (!productId || !Number.isFinite(qty) || qty <= 0) throw new HttpError(400, 'Invalid item')

        const productQuery = Product.findById(productId)
        const product = session ? await productQuery.session(session) : await productQuery
        if (!product || !product.isActive) throw new HttpError(404, 'Product not found')

        const vendorQuery = Vendor.findById(product.vendor)
        const vendor = session ? await vendorQuery.session(session) : await vendorQuery
        if (!vendor || !vendor.isApproved) throw new HttpError(400, 'Vendor is not available')

        if (buyerVendor && String(buyerVendor._id) === String(vendor._id)) {
          throw new HttpError(400, 'You cannot purchase your own product')
        }

        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          session ? { new: true, session } : { new: true },
        )
        if (!updated) throw new HttpError(400, `Not enough stock for: ${product.name}`)

        decremented.push({ productId: product._id, qty })

        const price = product.price
        const lineTotal = price * qty
        subtotal += lineTotal
        orderItems.push({
          product: product._id,
          vendor: vendor._id,
          name: product.name,
          price,
          qty,
          lineTotal,
        })
      }

      const commissionAmount = Number((subtotal * commissionRate).toFixed(2))
      const total = Number((subtotal + commissionAmount).toFixed(2))

      const orderDocs = await Order.create(
        [
          {
            buyer: req.user._id,
            items: orderItems,
            subtotal,
            commissionRate,
            commissionAmount,
            total,
            status: ORDER_STATUS.PAID,
            shippingAddress,
          },
        ],
        session ? { session } : undefined,
      )

      return { order: orderDocs[0] }
    } catch (err) {
      // best-effort rollback when not fully transactional
      if (decremented.length > 0) {
        await Promise.all(
          decremented.map((d) => Product.updateOne({ _id: d.productId }, { $inc: { stock: d.qty } })),
        )
      }
      throw err
    }
  }

  // Try transaction first; fallback if MongoDB isn't a replica set.
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    const { order } = await run({ session })
    await session.commitTransaction()
    return res.status(201).json({ order })
  } catch (err) {
    try {
      await session.abortTransaction()
    } catch {
      // ignore
    }

    if (isReplicaSetTransactionError(err)) {
      const { order } = await run({ session: null })
      return res.status(201).json({ order })
    }

    throw err
  } finally {
    session.endSession()
  }
}

async function listMyOrders(req, res) {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 }).limit(50)
  res.json({ orders })
}

async function getMyOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id })
    .populate({ path: 'items.product', select: 'images category' })
    .populate({ path: 'items.vendor', select: 'storeName' })
  if (!order) throw new HttpError(404, 'Order not found')
  res.json({ order })
}

async function listVendorOrders(req, res) {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const orders = await Order.find({ 'items.vendor': vendor._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate({ path: 'buyer', select: 'name email' })

  res.json({ orders })
}

async function vendorUpdateOrderStatus(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const { status } = req.body
  if (![ORDER_STATUS.SHIPPED, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(status)) {
    throw new HttpError(400, 'Invalid status')
  }

  const order = await Order.findOne({ _id: req.params.id, 'items.vendor': vendor._id })
  if (!order) throw new HttpError(404, 'Order not found')

  // simplified: status applies to whole order
  order.status = status
  await order.save()

  res.json({ order })
}

module.exports = {
  checkout,
  listMyOrders,
  getMyOrder,
  listVendorOrders,
  vendorUpdateOrderStatus,
}
