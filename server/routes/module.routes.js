import express from "express";

import {
  requireAuth
} from "../middleware/auth.middleware.js";

import syncUser from "../middleware/user.middleware.js";

import validate from "../utils/validate.js";

import {
  createModuleSchema,
  updateModuleSchema
} from "../validators/module.validator.js";

import {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule
} from "../controllers/module.controller.js";

const router = express.Router();

/*
  All module routes require authentication.
*/
router.use(
  requireAuth,
  syncUser
);

/*
  POST /api/modules/course/:courseId

  Create a module inside a course.
*/
router.post(
  "/course/:courseId",
  validate(createModuleSchema),
  createModule
);

/*
  GET /api/modules/course/:courseId

  Get all modules belonging to a course.
*/
router.get(
  "/course/:courseId",
  getModulesByCourse
);

/*
  GET /api/modules/:moduleId

  Get a single module with its lessons.
*/
router.get(
  "/:moduleId",
  getModuleById
);

/*
  PUT /api/modules/:moduleId

  Update module information.
*/
router.put(
  "/:moduleId",
  validate(updateModuleSchema),
  updateModule
);

/*
  DELETE /api/modules/:moduleId

  Delete a module and its lessons.
*/
router.delete(
  "/:moduleId",
  deleteModule
);

export default router;