const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    storeName: { type: String, required: true, trim: true, index: true },
    bio: { type: String, default: '' },
    isApproved: { type: Boolean, default: false, index: true },
    commissionRate: { type: Number, min: 0, max: 1 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports = { Vendor }
