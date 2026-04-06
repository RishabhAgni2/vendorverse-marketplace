const { validationResult } = require('express-validator')
const { Review } = require('../models/Review')
const { Product } = require('../models/Product')
const { Vendor } = require('../models/Vendor')
const { Order } = require('../models/Order')
const { HttpError } = require('../utils/httpError')

async function recomputeProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const row = stats[0]
  await Product.updateOne(
    { _id: productId },
    { $set: { ratingAvg: row ? row.avg : 0, ratingCount: row ? row.count : 0 } },
  )
}

async function recomputeVendorRating(vendorId) {
  const stats = await Review.aggregate([
    { $match: { vendor: vendorId } },
    { $group: { _id: '$vendor', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const row = stats[0]
  await Vendor.updateOne(
    { _id: vendorId },
    { $set: { ratingAvg: row ? row.avg : 0, ratingCount: row ? row.count : 0 } },
  )
}

async function createReview(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const { productId, rating, comment } = req.body
  const product = await Product.findById(productId)
  if (!product || !product.isActive) throw new HttpError(404, 'Product not found')

  const purchased = await Order.exists({ buyer: req.user._id, 'items.product': product._id })
  if (!purchased) throw new HttpError(403, 'You can only review products you purchased')

  const vendor = await Vendor.findById(product.vendor)
  if (!vendor) throw new HttpError(400, 'Vendor not available')

  const review = await Review.findOneAndUpdate(
    { buyer: req.user._id, product: product._id },
    { $set: { vendor: vendor._id, rating, comment: comment || '' } },
    { new: true, upsert: true },
  )

  await Promise.all([recomputeProductRating(product._id), recomputeVendorRating(vendor._id)])

  res.status(201).json({ review })
}

async function listProductReviews(req, res) {
  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate({ path: 'buyer', select: 'name' })
  res.json({ reviews })
}

module.exports = { createReview, listProductReviews }
