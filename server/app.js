import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import { env } from "./config/env.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import generateRoutes from "./routes/generate.routes.js";
import courseRoutes from "./routes/course.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import youtubeRoutes from "./routes/youtube.routes.js";
import translationRoutes from "./routes/translation.routes.js";
import audioRoutes from "./routes/audio.routes.js";
import progressRoutes from "./routes/progress.routes.js";

// Error handling
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";


const app = express();


/*
|--------------------------------------------------------------------------
| Trust Proxy
|--------------------------------------------------------------------------
|
| Required when the application is deployed behind a proxy
| such as Render.
|
*/

if (env.nodeEnv === "production") {
  app.set(
    "trust proxy",
    1
  );
}


/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet()
);


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);


/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb"
  })
);


/*
|--------------------------------------------------------------------------
| Request Logging
|--------------------------------------------------------------------------
*/

if (
  env.nodeEnv === "development"
) {
  app.use(
    morgan("dev")
  );
}


/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
|
| Generated audio files are stored in:
|
| uploads/
|   audio/
|
| The audio service returns URLs such as:
|
| /uploads/audio/lesson-<lessonId>.wav
|
| This middleware makes those files publicly accessible.
|
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    ),
    {
      fallthrough: true,
      index: false
    }
  )
);


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Text-to-Learn API is running",

      environment:
        env.nodeEnv,

      timestamp:
        new Date().toISOString()
    });
  }
);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);


/*
|--------------------------------------------------------------------------
| AI Course / Lesson Generation
|--------------------------------------------------------------------------
*/

app.use(
  "/api/generate",
  generateRoutes
);


/*
|--------------------------------------------------------------------------
| Courses
|--------------------------------------------------------------------------
*/

app.use(
  "/api/courses",
  courseRoutes
);


/*
|--------------------------------------------------------------------------
| Modules
|--------------------------------------------------------------------------
*/

app.use(
  "/api/modules",
  moduleRoutes
);


/*
|--------------------------------------------------------------------------
| Lessons
|--------------------------------------------------------------------------
*/

app.use(
  "/api/lessons",
  lessonRoutes
);


/*
|--------------------------------------------------------------------------
| YouTube
|--------------------------------------------------------------------------
*/

app.use(
  "/api/youtube",
  youtubeRoutes
);


/*
|--------------------------------------------------------------------------
| Translation
|--------------------------------------------------------------------------
*/

app.use(
  "/api/translation",
  translationRoutes
);


/*
|--------------------------------------------------------------------------
| Audio / Text-to-Speech
|--------------------------------------------------------------------------
*/

app.use(
  "/api/audio",
  audioRoutes
);


/*
|--------------------------------------------------------------------------
| Learning Progress
|--------------------------------------------------------------------------
*/

app.use(
  "/api/progress",
  progressRoutes
);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
|
| This MUST come after all API routes and
| before the global error handler.
|
*/

app.use(
  notFoundMiddleware
);


/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
|
| This MUST be the last middleware.
|
*/

app.use(
  errorMiddleware
);


export default app;
