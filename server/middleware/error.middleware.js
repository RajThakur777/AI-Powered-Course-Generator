import mongoose from "mongoose";

import AppError from "../utils/AppError.js";


/*
  ============================================================
  GLOBAL ERROR HANDLING MIDDLEWARE
  ============================================================

  This middleware must be registered AFTER
  all routes.

  Example:

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
*/


const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
  /*
    Log the complete error on the server.
  */
  console.error(
    "ERROR:",
    err
  );


  /*
    Start with the original error.
  */
  let error = err;


  /*
    ----------------------------------------------------------
    MONGOOSE INVALID OBJECT ID
    ----------------------------------------------------------
  */
  if (
    err instanceof mongoose.Error.CastError
  ) {
    error = new AppError(
      "Invalid resource ID.",
      400
    );
  }


  /*
    ----------------------------------------------------------
    MONGOOSE VALIDATION ERROR
    ----------------------------------------------------------
  */
  else if (
    err instanceof mongoose.Error.ValidationError
  ) {
    const messages =
      Object.values(
        err.errors
      ).map(
        (validationError) =>
          validationError.message
      );

    error = new AppError(
      messages.join(", "),
      400
    );
  }


  /*
    ----------------------------------------------------------
    MONGOOSE DUPLICATE KEY ERROR
    ----------------------------------------------------------
  */
  else if (
    err?.code === 11000
  ) {
    const duplicateFields =
      Object.keys(
        err.keyPattern || {}
      );

    error = new AppError(
      `Duplicate value for field(s): ${duplicateFields.join(", ")}.`,
      409
    );
  }


  /*
    ----------------------------------------------------------
    APP ERROR
    ----------------------------------------------------------
  */
  else if (
    !(err instanceof AppError)
  ) {
    error = new AppError(
      err?.message ||
        "Internal server error.",

      err?.statusCode ||
        500
    );
  }


  /*
    ----------------------------------------------------------
    RESPONSE
    ----------------------------------------------------------
  */
  const response = {
    success: false,
    message:
      error.message ||
      "Internal server error."
  };


  /*
    Include stack trace only
    during development.
  */
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    response.stack =
      error.stack;
  }


  res.status(
    error.statusCode || 500
  ).json(response);
};


export default errorMiddleware;