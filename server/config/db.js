import mongoose from "mongoose";

import { env } from "./env.js";

const connectDB = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error(
        "MONGO_URI is not configured in the .env file."
      );
    }

    const connection = await mongoose.connect(
      env.mongoUri
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    console.log(
      `Database: ${connection.connection.name}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed."
    );

    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;