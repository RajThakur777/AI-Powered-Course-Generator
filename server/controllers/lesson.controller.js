import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";


/*
  Helper function

  Verify that a module belongs
  to a course owned by the user.
*/
const verifyModuleOwnership =
  async (
    moduleId,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        moduleId
      )
    ) {
      throw new AppError(
        "Invalid module ID.",
        400
      );
    }

    const module =
      await Module.findById(
        moduleId
      );

    if (!module) {
      throw new AppError(
        "Module not found.",
        404
      );
    }

    const course =
      await Course.findOne({
        _id: module.course,
        creator: userId
      });

    if (!course) {
      throw new AppError(
        "Module not found.",
        404
      );
    }

    return {
      module,
      course
    };
  };


/*
  Helper function

  Verify that a lesson belongs
  to a course owned by the user.
*/
const verifyLessonOwnership =
  async (
    lessonId,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        lessonId
      )
    ) {
      throw new AppError(
        "Invalid lesson ID.",
        400
      );
    }

    const lesson =
      await Lesson.findById(
        lessonId
      );

    if (!lesson) {
      throw new AppError(
        "Lesson not found.",
        404
      );
    }

    const module =
      await Module.findById(
        lesson.module
      );

    if (!module) {
      throw new AppError(
        "Parent module not found.",
        404
      );
    }

    const course =
      await Course.findOne({
        _id: module.course,
        creator: userId
      });

    if (!course) {
      throw new AppError(
        "Lesson not found.",
        404
      );
    }

    return {
      lesson,
      module,
      course
    };
  };


/*
  POST /api/lessons/module/:moduleId

  Create lesson inside a module.
*/
export const createLesson =
  asyncHandler(
    async (req, res) => {
      const { moduleId } =
        req.params;

      const {
        module
      } =
        await verifyModuleOwnership(
          moduleId,
          req.user._id
        );

      const {
        title,
        order,
        objectives,
        keyTopics,
        content,
        videoQuery
      } = req.body;

      const lesson =
        await Lesson.create({
          title,
          order,
          objectives:
            objectives || [],
          keyTopics:
            keyTopics || [],
          content:
            content || [],
          videoQuery:
            videoQuery || "",
          module:
            module._id
        });

      /*
        Add lesson ID to module.
      */
      module.lessons.push(
        lesson._id
      );

      await module.save();

      res.status(201).json({
        success: true,
        message:
          "Lesson created successfully.",
        data: lesson
      });
    }
  );


/*
  GET /api/lessons/module/:moduleId

  Get all lessons belonging
  to a module.
*/
export const getLessonsByModule =
  asyncHandler(
    async (req, res) => {
      const { moduleId } =
        req.params;

      await verifyModuleOwnership(
        moduleId,
        req.user._id
      );

      const lessons =
        await Lesson.find({
          module: moduleId
        })
          .sort({
            order: 1
          });

      res.status(200).json({
        success: true,
        count: lessons.length,
        data: lessons
      });
    }
  );


/*
  GET /api/lessons/:lessonId

  Get a single lesson.
*/
export const getLessonById =
  asyncHandler(
    async (req, res) => {
      const { lessonId } =
        req.params;

      const {
        lesson
      } =
        await verifyLessonOwnership(
          lessonId,
          req.user._id
        );

      res.status(200).json({
        success: true,
        data: lesson
      });
    }
  );


/*
  PUT /api/lessons/:lessonId

  Update lesson.
*/
export const updateLesson =
  asyncHandler(
    async (req, res) => {
      const { lessonId } =
        req.params;

      await verifyLessonOwnership(
        lessonId,
        req.user._id
      );

      const allowedFields = [
        "title",
        "order",
        "objectives",
        "keyTopics",
        "content",
        "videoQuery"
      ];

      const updates = {};

      for (
        const field of allowedFields
      ) {
        if (
          req.body[field] !==
          undefined
        ) {
          updates[field] =
            req.body[field];
        }
      }

      if (
        Object.keys(updates)
          .length === 0
      ) {
        throw new AppError(
          "No valid fields provided for update.",
          400
        );
      }

      const lesson =
        await Lesson.findByIdAndUpdate(
          lessonId,
          updates,
          {
            new: true,
            runValidators: true
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Lesson updated successfully.",
        data: lesson
      });
    }
  );


/*
  DELETE /api/lessons/:lessonId

  Delete lesson and associated progress.
*/
export const deleteLesson =
  asyncHandler(
    async (req, res) => {
      const { lessonId } =
        req.params;

      const {
        lesson,
        module
      } =
        await verifyLessonOwnership(
          lessonId,
          req.user._id
        );

      /*
        Delete progress records.
      */
      await Progress.deleteMany({
        lesson: lesson._id
      });

      /*
        Remove lesson ID from module.
      */
      await Module.updateOne(
        {
          _id: module._id
        },
        {
          $pull: {
            lessons: lesson._id
          }
        }
      );

      /*
        Delete lesson.
      */
      await Lesson.deleteOne({
        _id: lesson._id
      });

      res.status(200).json({
        success: true,
        message:
          "Lesson and associated progress were deleted successfully."
      });
    }
  );