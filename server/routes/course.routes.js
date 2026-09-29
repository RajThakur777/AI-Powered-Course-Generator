import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import validate from "../utils/validate.js";

import {
  createCourseSchema,
  updateCourseSchema
} from "../validators/course.validator.js";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} from "../controllers/course.controller.js";

const router = express.Router();

/*
  All course routes require authentication.

  req.user will be populated by syncUser.
*/
router.use(
  requireAuth,
  syncUser
);

/*
  POST /api/courses

  Create/save a generated course.
*/
router.post(
  "/",
  validate(createCourseSchema),
  createCourse
);

/*
  GET /api/courses

  Get all courses created by the logged-in user.
*/
router.get(
  "/",
  getCourses
);

/*
  GET /api/courses/:courseId

  Get a single course with its modules and lessons.
*/
router.get(
  "/:courseId",
  getCourseById
);

/*
  PUT /api/courses/:courseId

  Update course information.
*/
router.put(
  "/:courseId",
  validate(updateCourseSchema),
  updateCourse
);

/*
  DELETE /api/courses/:courseId

  Delete a course and its modules/lessons.
*/
router.delete(
  "/:courseId",
  deleteCourse
);

export default router;