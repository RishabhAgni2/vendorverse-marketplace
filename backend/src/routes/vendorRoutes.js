const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth, requireRole } = require('../middlewares/auth')
const { getMyVendor, updateMyVendor, myStats } = require('../controllers/vendorController')
const { listVendorOrders, vendorUpdateOrderStatus } = require('../controllers/orderController')

const router = express.Router()

router.use(requireAuth, requireRole('vendor'))

router.get('/me', asyncHandler(getMyVendor))
router.patch(
  '/me',
  [body('storeName').optional().isString().trim().isLength({ min: 2 }), body('bio').optional().isString()],
  asyncHandler(updateMyVendor),
)

router.get('/orders', asyncHandler(listVendorOrders))
router.patch(
  '/orders/:id/status',
  [body('status').isIn(['shipped', 'completed', 'cancelled'])],
  asyncHandler(vendorUpdateOrderStatus),
)

router.get('/stats', asyncHandler(myStats))

module.exports = { vendorRoutes: router }
