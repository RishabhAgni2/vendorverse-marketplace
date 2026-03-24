const jwt = require('jsonwebtoken')
const { HttpError } = require('../utils/httpError')
const { User } = require('../models/User')

function getTokenFromHeader(req) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) return null
  return token
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req)
    if (!token) throw new HttpError(401, 'Missing token')

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is required')

    const payload = jwt.verify(token, secret)
    const user = await User.findById(payload.sub).select('-passwordHash')
    if (!user) throw new HttpError(401, 'Invalid token')

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) return next(new HttpError(401, 'Unauthorized'))
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'Forbidden'))
    next()
  }
}

module.exports = { requireAuth, requireRole }
