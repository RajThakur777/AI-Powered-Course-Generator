import axios from "axios";

import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";


/*
  ============================================================
  IN-MEMORY CACHE
  ============================================================

  Used during development to reduce
  unnecessary YouTube API calls.

  Cache duration:
  6 hours
*/


const videoCache =
  new Map();


const CACHE_DURATION =
  1000 *
  60 *
  60 *
  6;


/*
  ============================================================
  SEARCH YOUTUBE VIDEOS
  ============================================================
*/

export const searchYouTubeVideos =
  async (query) => {
    /*
      Validate query.
    */
    if (
      !query ||
      typeof query !== "string"
    ) {
      throw new AppError(
        "YouTube search query is required.",
        400
      );
    }


    const trimmedQuery =
      query.trim();


    if (
      trimmedQuery.length === 0
    ) {
      throw new AppError(
        "YouTube search query cannot be empty.",
        400
      );
    }


    if (
      trimmedQuery.length > 300
    ) {
      throw new AppError(
        "YouTube search query cannot exceed 300 characters.",
        400
      );
    }


    /*
      Validate API key.
    */
    if (
      !env.youtubeApiKey
    ) {
      throw new AppError(
        "YouTube API key is not configured.",
        500
      );
    }


    /*
      Normalize cache key.
    */
    const cacheKey =
      trimmedQuery
        .toLowerCase()
        .replace(
          /\s+/g,
          " "
        );


    /*
      Check cache.
    */
    const cached =
      videoCache.get(
        cacheKey
      );


    if (cached) {
      const cacheAge =
        Date.now() -
        cached.timestamp;


      if (
        cacheAge <
        CACHE_DURATION
      ) {
        return cached.data;
      }


      videoCache.delete(
        cacheKey
      );
    }


    try {
      /*
        YouTube Data API v3.
      */
      const response =
        await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",

              q: trimmedQuery,

              type: "video",

              videoEmbeddable:
                "true",

              maxResults: 3,

              relevanceLanguage:
                "en",

              safeSearch:
                "moderate",

              key:
                env.youtubeApiKey
            },

            timeout: 10000
          }
        );


      const items =
        Array.isArray(
          response?.data?.items
        )
          ? response.data.items
          : [];


      /*
        Convert YouTube response
        into application format.
      */
      const videos =
        items
          .filter(
            (item) =>
              item?.id?.videoId
          )
          .map(
            (item) => {
              const videoId =
                item.id.videoId;

              return {
                videoId,

                title:
                  item.snippet
                    ?.title || "",

                description:
                  item.snippet
                    ?.description || "",

                channelTitle:
                  item.snippet
                    ?.channelTitle || "",

                publishedAt:
                  item.snippet
                    ?.publishedAt ||
                  null,

                thumbnail:
                  item.snippet
                    ?.thumbnails
                    ?.high
                    ?.url ||

                  item.snippet
                    ?.thumbnails
                    ?.medium
                    ?.url ||

                  item.snippet
                    ?.thumbnails
                    ?.default
                    ?.url ||

                  "",

                url:
                  `https://www.youtube.com/watch?v=${videoId}`
              };
            }
          );


      /*
        Save result in cache.
      */
      videoCache.set(
        cacheKey,
        {
          timestamp:
            Date.now(),

          data:
            videos
        }
      );


      return videos;
    } catch (error) {
      console.error(
        "YouTube API error:",
        error.response
          ?.data ||
          error.message
      );


      /*
        Handle common API errors.
      */
      const reason =
        error.response
          ?.data
          ?.error
          ?.errors?.[0]
          ?.reason;


      if (
        reason ===
        "quotaExceeded"
      ) {
        throw new AppError(
          "YouTube API quota has been exceeded.",
          503
        );
      }


      if (
        error.code ===
        "ECONNABORTED"
      ) {
        throw new AppError(
          "YouTube API request timed out.",
          504
        );
      }


      throw new AppError(
        "Failed to search YouTube videos.",
        502
      );
    }
  };
