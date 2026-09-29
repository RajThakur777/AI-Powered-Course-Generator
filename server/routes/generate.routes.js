import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import validate from "../utils/validate.js";

import {
  generateCourseSchema,
  generateLessonSchema
} from "../validators/generate.validator.js";

import {
  generateCourse,
  generateLesson
} from "../controllers/generate.controller.js";

const router = express.Router();

/*
  POST /api/generate/course

  Generate a complete course outline using Gemini.
*/
router.post(
  "/course",
  requireAuth,
  syncUser,
  validate(generateCourseSchema),
  generateCourse
);

/*
  POST /api/generate/lesson

  Generate detailed lesson content using Gemini.
*/
router.post(
  "/lesson",
  requireAuth,
  syncUser,
  validate(generateLessonSchema),
  generateLesson
);

export default router;