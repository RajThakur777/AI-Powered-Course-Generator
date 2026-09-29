import { auth } from "express-oauth2-jwt-bearer";

import { env } from "../config/env.js";


/*
  ============================================================
  AUTHENTICATION MIDDLEWARE
  ============================================================

  This middleware validates the JWT access token
  issued by Auth0.

  Every protected API route uses this middleware.

  Example:

  router.get(
    "/",
    requireAuth,
    syncUser,
    controller
  );

  Flow:

  Client
    ↓
  Authorization: Bearer <access_token>
    ↓
  Auth0 JWT validation
    ↓
  req.auth
    ↓
  Controller
*/


/*
  Validate required Auth0 configuration
  when the server starts.
*/
if (
  !env.auth0Domain ||
  !env.auth0Audience
) {
  console.warn(
    "WARNING: Auth0 authentication is not fully configured."
  );
}


/*
  Auth0 JWT authentication middleware.
*/
export const requireAuth = auth({
  issuerBaseURL:
    env.auth0Domain
      ? `https://${env.auth0Domain}/`
      : undefined,

  audience:
    env.auth0Audience,

  /*
    Reject tokens that are not intended
    for this API.
  */
  strict: false
});