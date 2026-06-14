class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal server error';

  // Log error details (can be extended to use a logging service)
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = 'Validation error';
  }

  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token has expired';
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    err.statusCode = 400;
    err.message = 'Duplicate field value entered';
  }

  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = 'Invalid ID format';
  }

  // Handle database errors
  if (err.code === 'ECONNREFUSED') {
    err.statusCode = 503;
    err.message = 'Database connection failed';
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };
