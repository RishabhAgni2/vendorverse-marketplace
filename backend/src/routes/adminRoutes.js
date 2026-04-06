const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth, requireRole } = require('../middlewares/auth')
const { listVendors, approveVendor, revenueStats } = require('../controllers/adminController')

const router = express.Router()

router.use(requireAuth, requireRole('admin'))

router.get('/vendors', asyncHandler(listVendors))
router.patch(
  '/vendors/:vendorId/approval',
  [body('isApproved').isBoolean()],
  asyncHandler(approveVendor),
)

router.get('/stats/revenue', asyncHandler(revenueStats))

module.exports = { adminRoutes: router }
