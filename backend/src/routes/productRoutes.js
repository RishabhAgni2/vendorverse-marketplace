const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const { listProducts, getProduct } = require('../controllers/productController')

const router = express.Router()

router.get('/', asyncHandler(listProducts))
router.get('/:id', asyncHandler(getProduct))

module.exports = { productRoutes: router }
