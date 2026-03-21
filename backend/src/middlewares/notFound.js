const { HttpError } = require('../utils/httpError')

function notFound(req,res,next){
    next(new HttpError(404,`Not found: ${req.method} ${req.originalUrl}`))
}

module.exports = { notFound }