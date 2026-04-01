const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true },
)

reviewSchema.index({ buyer: 1, product: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

module.exports = { Review }
