const cors = require('cors')
const express = require('express')
const { authRoutes } = require('./routes/authRoutes')
const { productRoutes } = require('./routes/productRoutes')
const { orderRoutes } = require('./routes/orderRoutes')
const { reviewRoutes } = require('./routes/reviewRoutes')
const { vendorRoutes } = require('./routes/vendorRoutes')
const { vendorProductRoutes } = require('./routes/vendorProductRoutes')
const { adminRoutes } = require('./routes/adminRoutes')
const { notFound } = require('./middlewares/notFound')
const { errorHandler } = require('./middlewares/errorHandler')

function isAllowedDevOrigin(origin) {
  try {
    const url = new URL(origin)
    return ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

function createApp() {
  const app = express()
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          corsOrigins.length === 0 ||
          corsOrigins.includes(origin) ||
          (process.env.NODE_ENV !== 'production' && isAllowedDevOrigin(origin))
        ) {
          return callback(null, true)
        }
        return callback(new Error(`Origin not allowed: ${origin}`))
      },
      credentials: true,
    }),
  )
  app.use(express.json())

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/reviews', reviewRoutes)
  app.use('/api/vendor', vendorRoutes)
  app.use('/api/vendor/products', vendorProductRoutes)
  app.use('/api/admin', adminRoutes)
  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { createApp }
