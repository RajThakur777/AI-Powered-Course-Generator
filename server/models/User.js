import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /*
      Auth0 unique user identifier.

      Example:
      auth0|123456789
    */
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },

    /*
      User email.

      This is optional because an Auth0
      access token may not always contain
      an email claim.
    */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ""
    },

    /*
      User display name.
    */
    name: {
      type: String,
      trim: true,
      default: ""
    },

    /*
      Auth0 profile picture URL.
    */
    picture: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);


/*
  Create User model.
*/
const User = mongoose.model(
  "User",
  userSchema
);

export default User;

