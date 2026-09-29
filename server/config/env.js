import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "MONGO_URI",
  "GEMINI_API_KEY"
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.warn(
      `WARNING: Environment variable ${variable} is not configured.`
    );
  }
}

export const env = {
  // Server
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Frontend
  clientUrl:
    process.env.CLIENT_URL || "http://localhost:5173",

  // MongoDB
  mongoUri: process.env.MONGO_URI,

  // Auth0
  auth0Domain: process.env.AUTH0_DOMAIN,
  auth0Audience: process.env.AUTH0_AUDIENCE,

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY,

  geminiModel:
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",

  geminiFallbackModel:
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash",

  // YouTube
  youtubeApiKey: process.env.YOUTUBE_API_KEY
};