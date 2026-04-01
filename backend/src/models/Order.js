const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const ORDER_STATUS = /** @type {const} */ ({
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
})

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0, max: 1 },
    commissionAmount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

orderSchema.index({ createdAt: -1 })

const Order = mongoose.model('Order', orderSchema)

module.exports = { Order, ORDER_STATUS }
