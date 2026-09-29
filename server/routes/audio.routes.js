import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import {
  generateLessonAudio,
  getLessonAudio
} from "../controllers/audio.controller.js";

const router = express.Router();

/*
  POST /api/audio/lesson/:lessonId

  Generate Hinglish audio for a lesson.
*/
router.post(
  "/lesson/:lessonId",
  requireAuth,
  syncUser,
  generateLessonAudio
);

/*
  GET /api/audio/lesson/:lessonId

  Get the existing audio URL for a lesson.
*/
router.get(
  "/lesson/:lessonId",
  requireAuth,
  syncUser,
  getLessonAudio
);

export default router;