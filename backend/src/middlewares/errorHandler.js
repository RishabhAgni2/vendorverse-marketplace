const { HttpError } = require('../utils/httpError')

function errorHandler(err, req, res, next) {
  const statusCode =
    err instanceof HttpError
      ? err.statusCode
      : typeof err.statusCode === 'number'
        ? err.statusCode
        : 500

  const payload = {
    message: err?.message || 'Server error',
  }

  if (err instanceof HttpError && err.details !== undefined) {
    payload.details = err.details
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err?.stack
    payload.name = err?.name
  }

  res.status(statusCode).json(payload)
}

module.exports = { errorHandler }
