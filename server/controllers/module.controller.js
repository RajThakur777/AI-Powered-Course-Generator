import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";


/*
  Helper function

  Verify that a course belongs
  to the authenticated user.
*/
const verifyCourseOwnership =
  async (
    courseId,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      throw new AppError(
        "Invalid course ID.",
        400
      );
    }

    const course =
      await Course.findOne({
        _id: courseId,
        creator: userId
      });

    if (!course) {
      throw new AppError(
        "Course not found.",
        404
      );
    }

    return course;
  };


/*
  Helper function

  Verify module ownership through
  its parent course.
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
  POST /api/modules/course/:courseId

  Create a module inside a course.
*/
export const createModule =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

      const course =
        await verifyCourseOwnership(
          courseId,
          req.user._id
        );

      const {
        title,
        description,
        order
      } = req.body;

      const module =
        await Module.create({
          title,
          description:
            description || "",
          order,
          course:
            course._id,
          lessons: []
        });

      /*
        Add module ID to course.
      */
      course.modules.push(
        module._id
      );

      await course.save();

      res.status(201).json({
        success: true,
        message:
          "Module created successfully.",
        data: module
      });
    }
  );


/*
  GET /api/modules/course/:courseId

  Get all modules of a course.
*/
export const getModulesByCourse =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

      await verifyCourseOwnership(
        courseId,
        req.user._id
      );

      const modules =
        await Module.find({
          course: courseId
        })
          .sort({
            order: 1
          })
          .populate({
            path: "lessons",
            options: {
              sort: {
                order: 1
              }
            }
          });

      res.status(200).json({
        success: true,
        count: modules.length,
        data: modules
      });
    }
  );


/*
  GET /api/modules/:moduleId

  Get a single module with lessons.
*/
export const getModuleById =
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

      await module.populate({
        path: "lessons",
        options: {
          sort: {
            order: 1
          }
        }
      });

      res.status(200).json({
        success: true,
        data: module
      });
    }
  );


/*
  PUT /api/modules/:moduleId

  Update module.
*/
export const updateModule =
  asyncHandler(
    async (req, res) => {
      const { moduleId } =
        req.params;

      await verifyModuleOwnership(
        moduleId,
        req.user._id
      );

      const allowedFields = [
        "title",
        "description",
        "order"
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

      const module =
        await Module.findByIdAndUpdate(
          moduleId,
          updates,
          {
            new: true,
            runValidators: true
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Module updated successfully.",
        data: module
      });
    }
  );


/*
  DELETE /api/modules/:moduleId

  Delete module, lessons and progress.
*/
export const deleteModule =
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

      /*
        Delete progress associated
        with this module's lessons.
      */
      const lessons =
        await Lesson.find({
          module: module._id
        }).select("_id");

      const lessonIds =
        lessons.map(
          (lesson) =>
            lesson._id
        );

      if (
        lessonIds.length > 0
      ) {
        await Progress.deleteMany({
          lesson: {
            $in: lessonIds
          }
        });
      }

      /*
        Delete lessons.
      */
      await Lesson.deleteMany({
        module: module._id
      });

      /*
        Remove module from course.
      */
      await Course.updateOne(
        {
          _id: module.course
        },
        {
          $pull: {
            modules: module._id
          }
        }
      );

      /*
        Delete module.
      */
      await Module.deleteOne({
        _id: module._id
      });

      res.status(200).json({
        success: true,
        message:
          "Module, its lessons and associated progress were deleted successfully."
      });
    }
  );