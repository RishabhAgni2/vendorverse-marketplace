const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth, requireRole } = require('../middlewares/auth')
const { checkout, listMyOrders, getMyOrder } = require('../controllers/orderController')

const router = express.Router()

router.use(requireAuth, requireRole('buyer'))

router.post(
  '/checkout',
  [
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isString().isLength({ min: 1 }),
    body('items.*.qty').isInt({ min: 1 }),
    body('shippingAddress.fullName').isString().trim().isLength({ min: 2 }),
    body('shippingAddress.phone').isString().trim().isLength({ min: 6 }),
    body('shippingAddress.addressLine1').isString().trim().isLength({ min: 3 }),
    body('shippingAddress.city').isString().trim().isLength({ min: 2 }),
    body('shippingAddress.country').isString().trim().isLength({ min: 2 }),
    body('shippingAddress.postalCode').optional().isString(),
  ],
  asyncHandler(checkout),
)
router.get('/', asyncHandler(listMyOrders))
router.get('/:id', asyncHandler(getMyOrder))

module.exports = { orderRoutes: router }
