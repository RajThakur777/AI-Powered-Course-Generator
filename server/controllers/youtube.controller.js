import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
  searchYouTubeVideos
} from "../services/youtube.service.js";


/*
  GET /api/youtube/search?q=javascript

  Search YouTube for educational videos.
*/
export const searchVideos =
  asyncHandler(
    async (req, res) => {
      const q = req.query.q || req.query.query;

      if (
        !q ||
        typeof q !== "string"
      ) {
        throw new AppError(
          "Search query is required.",
          400
        );
      }

      const query = q.trim();

      if (query.length === 0) {
        throw new AppError(
          "Search query cannot be empty.",
          400
        );
      }

      if (query.length > 300) {
        throw new AppError(
          "Search query cannot exceed 300 characters.",
          400
        );
      }

      const videos =
        await searchYouTubeVideos(
          query
        );

      res.status(200).json({
        success: true,
        count: videos.length,
        data: videos
      });
    }
  );