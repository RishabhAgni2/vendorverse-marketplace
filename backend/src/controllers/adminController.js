const { validationResult } = require('express-validator')
const { Vendor } = require('../models/Vendor')
const { Order } = require('../models/Order')
const { HttpError } = require('../utils/httpError')

async function listVendors(req, res) {
  const { status } = req.query
  const filter = {}
  if (status === 'pending') filter.isApproved = false
  if (status === 'approved') filter.isApproved = true

  const vendors = await Vendor.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate({ path: 'user', select: 'name email role createdAt' })
  res.json({ vendors })
}

async function approveVendor(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const { isApproved } = req.body
  const vendor = await Vendor.findById(req.params.vendorId)
  if (!vendor) throw new HttpError(404, 'Vendor not found')
  vendor.isApproved = Boolean(isApproved)
  await vendor.save()
  res.json({ vendor })
}

async function revenueStats(req, res) {
  // optional ?days=30
  const days = Math.max(1, Math.min(365, Number(req.query.days || 30)))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        grossSales: { $sum: '$subtotal' },
        commission: { $sum: '$commissionAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const totals = rows.reduce(
    (acc, r) => {
      acc.orders += r.orders
      acc.grossSales += r.grossSales
      acc.commission += r.commission
      return acc
    },
    { orders: 0, grossSales: 0, commission: 0 },
  )

  res.json({ days, totals, series: rows })
}

module.exports = { listVendors, approveVendor, revenueStats }
