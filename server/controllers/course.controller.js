import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";


/*
  POST /api/courses

  Create/save a generated course.
*/
export const createCourse = asyncHandler(
  async (req, res) => {
    const {
      title,
      description,
      originalPrompt,
      tags,
      difficulty,
      estimatedDuration
    } = req.body;

    const course = await Course.create({
      title,
      description,
      originalPrompt,
      creator: req.user._id,
      tags: tags || [],
      difficulty:
        difficulty || "beginner",
      estimatedDuration:
        estimatedDuration || "",
      modules: []
    });

    res.status(201).json({
      success: true,
      message:
        "Course created successfully.",
      data: course
    });
  }
);


/*
  GET /api/courses

  Get all courses created by
  the authenticated user.
*/
export const getCourses = asyncHandler(
  async (req, res) => {
    const courses =
      await Course.find({
        creator: req.user._id
      })
        .sort({
          createdAt: -1
        });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  }
);

/*
  GET /api/courses/explore/all

  Get all courses for the explore page.
*/
export const getAllCourses = asyncHandler(
  async (req, res) => {
    const courses =
      await Course.find()
        .sort({
          createdAt: -1
        })
        .populate('creator', 'name email'); // Optional: populate creator info if needed

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  }
);


/*
  GET /api/courses/:courseId

  Get a complete course with
  modules and lessons.
*/
export const getCourseById =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

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
          _id: courseId
        })
          .populate('creator', 'auth0Id')
          .populate({
            path: "modules",
            options: {
              sort: {
                order: 1
              }
            },
            populate: {
              path: "lessons",
              options: {
                sort: {
                  order: 1
                }
              }
            }
          });

      if (!course) {
        throw new AppError(
          "Course not found.",
          404
        );
      }

      res.status(200).json({
        success: true,
        data: course
      });
    }
  );


/*
  PUT /api/courses/:courseId

  Update course information.
*/
export const updateCourse =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

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

      const allowedFields = [
        "title",
        "description",
        "tags",
        "difficulty",
        "estimatedDuration"
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

      const course =
        await Course.findOneAndUpdate(
          {
            _id: courseId,
            creator: req.user._id
          },
          updates,
          {
            new: true,
            runValidators: true
          }
        );

      if (!course) {
        throw new AppError(
          "Course not found.",
          404
        );
      }

      res.status(200).json({
        success: true,
        message:
          "Course updated successfully.",
        data: course
      });
    }
  );


/*
  DELETE /api/courses/:courseId

  Delete:
    Course
    Modules
    Lessons
    Progress
*/
export const deleteCourse =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

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

      /*
        Find the course and verify
        ownership.
      */
      const course =
        await Course.findOne({
          _id: courseId,
          creator: req.user._id
        });

      if (!course) {
        throw new AppError(
          "Course not found.",
          404
        );
      }

      /*
        Find all modules belonging
        to this course.
      */
      const modules =
        await Module.find({
          course: course._id
        }).select("_id");

      const moduleIds =
        modules.map(
          (module) =>
            module._id
        );

      /*
        Find all lessons belonging
        to those modules.
      */
      let lessonIds = [];

      if (
        moduleIds.length > 0
      ) {
        const lessons =
          await Lesson.find({
            module: {
              $in: moduleIds
            }
          }).select("_id");

        lessonIds =
          lessons.map(
            (lesson) =>
              lesson._id
          );
      }

      /*
        Delete progress records
        before deleting lessons.
      */
      await Progress.deleteMany({
        course: course._id
      });

      /*
        Delete all lessons.
      */
      if (
        moduleIds.length > 0
      ) {
        await Lesson.deleteMany({
          module: {
            $in: moduleIds
          }
        });
      }

      /*
        Delete all modules.
      */
      await Module.deleteMany({
        course: course._id
      });

      /*
        Finally delete course.
      */
      await Course.deleteOne({
        _id: course._id
      });

      res.status(200).json({
        success: true,
        message:
          "Course and all associated modules, lessons and progress were deleted successfully."
      });
    }
  );