const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth, requireRole } = require('../middlewares/auth')
const { createReview, listProductReviews } = require('../controllers/reviewController')

const router = express.Router()

router.get('/product/:productId', asyncHandler(listProductReviews))

router.post(
  '/',
  requireAuth,
  requireRole('buyer'),
  [body('productId').isString().isLength({ min: 1 }), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().isString()],
  asyncHandler(createReview),
)

module.exports = { reviewRoutes: router }
