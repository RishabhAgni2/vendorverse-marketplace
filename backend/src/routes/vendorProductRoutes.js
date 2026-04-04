const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth, requireRole } = require('../middlewares/auth')
const {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

const router = express.Router()

router.use(requireAuth, requireRole('vendor'))

router.get('/', asyncHandler(listMyProducts))
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
    body('description').optional().isString(),
    body('images').optional().isArray(),
    body('category').optional().isString(),
    body('isActive').optional().isBoolean(),
  ],
  asyncHandler(createProduct),
)
router.patch(
  '/:id',
  [
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('description').optional().isString(),
    body('images').optional().isArray(),
    body('category').optional().isString(),
    body('isActive').optional().isBoolean(),
  ],
  asyncHandler(updateProduct),
)
router.delete('/:id', asyncHandler(deleteProduct))

module.exports = { vendorProductRoutes: router }
