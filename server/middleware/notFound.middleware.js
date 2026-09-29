import AppError from "../utils/AppError.js";


/*
  ============================================================
  404 NOT FOUND MIDDLEWARE
  ============================================================

  This middleware runs when no previous
  route matched the request.

  IMPORTANT:

  It must be registered AFTER all routes
  but BEFORE errorMiddleware.
*/


const notFoundMiddleware = (
  req,
  res,
  next
) => {
  const message =
    `Route not found: ${req.method} ${req.originalUrl}`;


  next(
    new AppError(
      message,
      404
    )
  );
};


export default notFoundMiddleware;
