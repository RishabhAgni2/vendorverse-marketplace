const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: { type: String, default: 'General', index: true },
    isActive: { type: Boolean, default: true, index: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

productSchema.index({ name: 'text', description: 'text', category: 'text' })

const Product = mongoose.model('Product', productSchema)

module.exports = { Product }
