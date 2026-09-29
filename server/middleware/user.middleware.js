import User from "../models/User.js";

import AppError from "../utils/AppError.js";


/*
  ============================================================
  USER SYNCHRONIZATION MIDDLEWARE
  ============================================================

  Purpose:

  Auth0 user
       ↓
  Extract Auth0 subject (sub)
       ↓
  Find/Create MongoDB user
       ↓
  Attach MongoDB user to req.user

  After this middleware runs:

  req.user = MongoDB User document
*/


const syncUser = async (
  req,
  res,
  next
) => {
  try {
    /*
      req.auth is populated by
      express-oauth2-jwt-bearer.

      The "sub" claim is the stable
      Auth0 user identifier.
    */
    const auth0Id =
      req.auth?.payload?.sub;


    /*
      Auth0 subject is mandatory.

      Without it we cannot identify
      the authenticated user.
    */
    if (!auth0Id) {
      throw new AppError(
        "Authenticated user identity is missing.",
        401
      );
    }


    /*
      Optional claims.

      Depending on your Auth0 configuration,
      email/name/picture may or may not be
      included in the access token.
    */
    const email =
      typeof req.auth?.payload?.email ===
      "string"
        ? req.auth.payload.email.trim()
        : "";

    const name =
      typeof req.auth?.payload?.name ===
      "string"
        ? req.auth.payload.name.trim()
        : "";

    const picture =
      typeof req.auth?.payload?.picture ===
      "string"
        ? req.auth.payload.picture.trim()
        : "";


    /*
      Find existing user.

      If the user doesn't exist,
      create a new MongoDB document.
    */
    let user =
      await User.findOne({
        auth0Id
      });


    /*
      New user.
    */
    if (!user) {
      user =
        await User.create({
          auth0Id,
          email,
          name,
          picture
        });
    }


    /*
      Existing user.

      Only update optional fields when
      Auth0 actually supplied them.

      This prevents an incomplete token
      from overwriting existing profile
      information with empty strings.
    */
    else {
      let hasChanges = false;


      if (
        email &&
        user.email !== email
      ) {
        user.email = email;
        hasChanges = true;
      }


      if (
        name &&
        user.name !== name
      ) {
        user.name = name;
        hasChanges = true;
      }


      if (
        picture &&
        user.picture !== picture
      ) {
        user.picture = picture;
        hasChanges = true;
      }


      if (hasChanges) {
        await user.save();
      }
    }


    /*
      Attach MongoDB user document
      to the request.

      Controllers can now use:

      req.user._id
      req.user.auth0Id
      req.user.email
      req.user.name
      req.user.picture
    */
    req.user = user;


    next();
  } catch (error) {
    next(error);
  }
};


export default syncUser;
