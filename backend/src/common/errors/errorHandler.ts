import { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 1. Custom Operational Errors (including 422 Request Validation errors from AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. Prisma Database Errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = err.meta?.target;
      message = `Unique constraint violation. Duplicate entry for: ${Array.isArray(target) ? target.join(', ') : target}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested database record was not found.';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Foreign key constraint violation.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
