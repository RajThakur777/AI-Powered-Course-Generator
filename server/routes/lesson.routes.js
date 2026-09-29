import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import validate from "../utils/validate.js";

import {
  createLessonSchema,
  updateLessonSchema
} from "../validators/lesson.validator.js";

import {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson
} from "../controllers/lesson.controller.js";

const router = express.Router();

/*
  All lesson routes require authentication.
*/
router.use(
  requireAuth,
  syncUser
);

/*
  POST /api/lessons/module/:moduleId

  Create a lesson inside a module.
*/
router.post(
  "/module/:moduleId",
  validate(createLessonSchema),
  createLesson
);

/*
  GET /api/lessons/module/:moduleId

  Get all lessons belonging to a module.
*/
router.get(
  "/module/:moduleId",
  getLessonsByModule
);

/*
  GET /api/lessons/:lessonId

  Get a single lesson.
*/
router.get(
  "/:lessonId",
  getLessonById
);

/*
  PUT /api/lessons/:lessonId

  Update lesson information/content.
*/
router.put(
  "/:lessonId",
  validate(updateLessonSchema),
  updateLesson
);

/*
  DELETE /api/lessons/:lessonId

  Delete a lesson.
*/
router.delete(
  "/:lessonId",
  deleteLesson
);

export default router;