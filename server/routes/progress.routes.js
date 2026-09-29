import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import validate from "../utils/validate.js";

import {
  updateProgressSchema
} from "../validators/progress.validator.js";

import {
  updateProgress,
  getCourseProgress,
  getLessonProgress
} from "../controllers/progress.controller.js";

const router = express.Router();

/*
  All progress routes require authentication.
*/
router.use(
  requireAuth,
  syncUser
);

/*
  POST /api/progress

  Create/update lesson progress.
*/
router.post(
  "/",
  validate(updateProgressSchema),
  updateProgress
);

/*
  GET /api/progress/course/:courseId

  Get overall progress for a course.
*/
router.get(
  "/course/:courseId",
  getCourseProgress
);

/*
  GET /api/progress/lesson/:lessonId

  Get progress for a specific lesson.
*/
router.get(
  "/lesson/:lessonId",
  getLessonProgress
);

export default router;