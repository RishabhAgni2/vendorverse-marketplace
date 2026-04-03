const express = require('express')
const { body } = require('express-validator')
const { asyncHandler } = require('../utils/asyncHandler')
const { requireAuth } = require('../middlewares/auth')
const { register, login, me } = require('../controllers/authController')

const router = express.Router()

router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('role').optional().isIn(['buyer', 'vendor']),
    body('storeName').optional().isString().trim().isLength({ min: 2 }),
  ],
  asyncHandler(register),
)

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 1 })],
  asyncHandler(login),
)

router.get('/me', requireAuth, asyncHandler(me))

module.exports = { authRoutes: router }
