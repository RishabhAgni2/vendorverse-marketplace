const { validationResult } = require('express-validator')
const { Product } = require('../models/Product')
const { Vendor } = require('../models/Vendor')
const { HttpError } = require('../utils/httpError')

async function listProducts(req, res) {
  const { q, category, vendorId } = req.query

  const filter = { isActive: true }
  if (category) filter.category = String(category)
  if (vendorId) filter.vendor = String(vendorId)
  if (q) filter.$text = { $search: String(q) }

  // Only show products from approved vendors
  if (!vendorId) {
    const approvedVendors = await Vendor.find({ isApproved: true }).select('_id')
    filter.vendor = { $in: approvedVendors.map((v) => v._id) }
  } else {
    const v = await Vendor.findById(String(vendorId)).select('isApproved')
    if (!v?.isApproved) return res.json({ products: [] })
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(60)
    .populate({ path: 'vendor', select: 'storeName ratingAvg ratingCount isApproved' })

  res.json({ products })
}

async function getProduct(req, res) {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate({
    path: 'vendor',
    select: 'storeName ratingAvg ratingCount isApproved',
  })
  if (!product) throw new HttpError(404, 'Product not found')
  if (!product.vendor?.isApproved) throw new HttpError(404, 'Product not found')
  res.json({ product })
}

async function listMyProducts(req, res) {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 })
  res.json({ products })
}

async function createProduct(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')
  if (!vendor.isApproved) throw new HttpError(403, 'Vendor is not approved yet')

  const { name, description, price, stock, images, category, isActive } = req.body
  const product = await Product.create({
    vendor: vendor._id,
    name,
    description: description || '',
    price,
    stock,
    images: Array.isArray(images) ? images : [],
    category: category || 'General',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  })

  res.status(201).json({ product })
}

async function updateProduct(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id })
  if (!product) throw new HttpError(404, 'Product not found')

  const { name, description, price, stock, images, category, isActive } = req.body
  if (name !== undefined) product.name = name
  if (description !== undefined) product.description = description
  if (price !== undefined) product.price = price
  if (stock !== undefined) product.stock = stock
  if (images !== undefined) product.images = Array.isArray(images) ? images : []
  if (category !== undefined) product.category = category
  if (isActive !== undefined) product.isActive = Boolean(isActive)
  await product.save()

  res.json({ product })
}

async function deleteProduct(req, res) {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id })
  if (!product) throw new HttpError(404, 'Product not found')

  await product.deleteOne()
  res.status(204).send()
}

module.exports = {
  listProducts,
  getProduct,
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
