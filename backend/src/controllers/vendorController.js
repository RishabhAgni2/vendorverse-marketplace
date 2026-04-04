const { validationResult } = require('express-validator')
const { Vendor } = require('../models/Vendor')
const { Order } = require('../models/Order')
const { HttpError } = require('../utils/httpError')

async function getMyVendor(req, res) {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')
  res.json({ vendor })
}

async function updateMyVendor(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const { storeName, bio } = req.body
  if (storeName !== undefined) vendor.storeName = storeName
  if (bio !== undefined) vendor.bio = bio
  await vendor.save()

  res.json({ vendor })
}

async function myStats(req, res) {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if (!vendor) throw new HttpError(404, 'Vendor profile not found')

  const rows = await Order.aggregate([
    { $match: { 'items.vendor': vendor._id } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    {
      $group: {
        _id: null,
        orders: { $addToSet: '$_id' },
        itemsSold: { $sum: '$items.qty' },
        grossSales: { $sum: '$items.lineTotal' },
      },
    },
    {
      $project: {
        _id: 0,
        ordersCount: { $size: '$orders' },
        itemsSold: 1,
        grossSales: 1,
      },
    },
  ])

  res.json({ vendorId: vendor._id, stats: rows[0] || { ordersCount: 0, itemsSold: 0, grossSales: 0 } })
}

module.exports = { getMyVendor, updateMyVendor, myStats }
