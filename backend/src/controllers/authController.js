const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { User, ROLES } = require('../models/User')
const { Vendor } = require('../models/Vendor')
const { HttpError } = require('../utils/httpError')

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is required')
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn: '7d' })
}

async function register(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const { name, email, password, role, storeName } = req.body
  const normalizedRole = role === ROLES.VENDOR ? ROLES.VENDOR : ROLES.BUYER

  const exists = await User.findOne({ email: String(email).toLowerCase() })
  if (exists) throw new HttpError(409, 'Email already in use')

  const user = new User({ name, email, role: normalizedRole, passwordHash: 'temp' })
  await user.setPassword(password)
  await user.save()

  let vendor = null
  if (normalizedRole === ROLES.VENDOR) {
    if (!storeName) throw new HttpError(400, 'storeName is required for vendor')
    vendor = await Vendor.create({ user: user._id, storeName, isApproved: false })
  }

  const token = signToken(user)
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    vendor: vendor ? { id: vendor._id, storeName: vendor.storeName, isApproved: vendor.isApproved } : null,
  })
}

async function login(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new HttpError(400, 'Validation error', errors.array())

  const { email, password } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash')
  if (!user) throw new HttpError(401, 'Invalid credentials')

  const ok = await user.verifyPassword(password)
  if (!ok) throw new HttpError(401, 'Invalid credentials')

  const token = signToken(user)

  let vendor = null
  if (user.role === ROLES.VENDOR) {
    vendor = await Vendor.findOne({ user: user._id })
  }

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    vendor: vendor ? { id: vendor._id, storeName: vendor.storeName, isApproved: vendor.isApproved } : null,
  })
}

async function me(req, res) {
  let vendor = null
  if (req.user.role === ROLES.VENDOR) {
    vendor = await Vendor.findOne({ user: req.user._id })
  }
  res.json({ user: req.user, vendor })
}

module.exports = { register, login, me }
