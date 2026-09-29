import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import {
  translateLesson
} from "../controllers/translation.controller.js";

const router = express.Router();

/*
  POST /api/translation/lesson/:lessonId

  Translate a lesson into natural Roman-script Hinglish.
*/
router.post(
  "/lesson/:lessonId",
  requireAuth,
  syncUser,
  translateLesson
);

export default router;