import http from "node:http";

import app from "./app.js";

import connectDB from "./config/db.js";

import { env } from "./config/env.js";


/*
|--------------------------------------------------------------------------
| Create HTTP Server
|--------------------------------------------------------------------------
*/

const server =
  http.createServer(app);


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer =
  async () => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Connect to MongoDB
      |--------------------------------------------------------------------------
      */

      await connectDB();


      /*
      |--------------------------------------------------------------------------
      | Start Express Server
      |--------------------------------------------------------------------------
      */

      server.listen(
        env.port,
        () => {
          console.log(
            "--------------------------------------------------"
          );

          console.log(
            "Text-to-Learn Backend"
          );

          console.log(
            "--------------------------------------------------"
          );

          console.log(
            `Server running on http://localhost:${env.port}`
          );

          console.log(
            `Environment: ${env.nodeEnv}`
          );

          console.log(
            `Health check: http://localhost:${env.port}/api/health`
          );

          console.log(
            "--------------------------------------------------"
          );
        }
      );


      /*
      |--------------------------------------------------------------------------
      | Server Error Handler
      |--------------------------------------------------------------------------
      */

      server.on(
        "error",
        (error) => {
          console.error(
            "HTTP server error:"
          );

          console.error(
            error
          );

          process.exit(1);
        }
      );
    } catch (error) {
      console.error(
        "Failed to start server:"
      );

      console.error(
        error.message
      );

      process.exit(1);
    }
  };


/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
|
| When Render, Docker, or another deployment platform
| stops/restarts the application, close the HTTP server
| cleanly instead of immediately terminating it.
|
*/

const gracefulShutdown =
  (signal) => {
    console.log(
      `${signal} received. Starting graceful shutdown...`
    );


    server.close(
      (error) => {
        if (error) {
          console.error(
            "Error while closing HTTP server:"
          );

          console.error(
            error
          );

          process.exit(1);
        }


        console.log(
          "HTTP server closed successfully."
        );


        process.exit(0);
      }
    );
  };


/*
|--------------------------------------------------------------------------
| Process Signals
|--------------------------------------------------------------------------
*/

process.on(
  "SIGTERM",
  () => {
    gracefulShutdown(
      "SIGTERM"
    );
  }
);

process.on(
  "SIGINT",
  () => {
    gracefulShutdown(
      "SIGINT"
    );
  }
);


/*
|--------------------------------------------------------------------------
| Start Application
|--------------------------------------------------------------------------
*/

startServer();