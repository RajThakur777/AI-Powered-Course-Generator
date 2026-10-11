import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import {
  searchVideos
} from "../controllers/youtube.controller.js";

const router = express.Router();

/*
  GET /api/youtube/search?q=javascript

  Search YouTube for relevant educational videos.
*/
router.get(
  "/search",
  requireAuth,
  syncUser,
  searchVideos
);

/*
  GET /api/youtube?query=...
  Support Milestone 9 direct route specification.
*/
router.get(
  "/",
  requireAuth,
  syncUser,
  searchVideos
);

export default router;