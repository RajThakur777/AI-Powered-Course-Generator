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
  Verify that a lesson belongs
  to the specified course.
*/
const verifyLessonBelongsToCourse =
  async (
    lessonId,
    courseId
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

    if (
      module.course.toString() !==
      courseId.toString()
    ) {
      throw new AppError(
        "Lesson does not belong to this course.",
        400
      );
    }

    return {
      lesson,
      module
    };
  };


/*
  POST /api/progress

  Create or update lesson progress.

  Request body:

  {
    "courseId": "...",
    "lessonId": "...",
    "completed": true,
    "quizScore": 80
  }
*/
export const updateProgress =
  asyncHandler(
    async (req, res) => {
      const {
        courseId,
        lessonId,
        completed,
        quizScore
      } = req.body;

      if (
        !courseId ||
        !lessonId
      ) {
        throw new AppError(
          "courseId and lessonId are required.",
          400
        );
      }

      /*
        Verify course ownership.
      */
      const course =
        await verifyCourseOwnership(
          courseId,
          req.user._id
        );

      /*
        Verify lesson belongs
        to this course.
      */
      const {
        lesson
      } =
        await verifyLessonBelongsToCourse(
          lessonId,
          course._id
        );

      /*
        Build update object.
      */
      const updateData = {};

      if (
        completed !== undefined
      ) {
        updateData.completed =
          completed;

        /*
          Set completion date only
          when completed.
        */
        if (completed === true) {
          updateData.completedAt =
            new Date();
        } else {
          updateData.completedAt =
            null;
        }
      }

      if (
        quizScore !== undefined
      ) {
        updateData.quizScore =
          quizScore;
      }

      if (
        Object.keys(updateData)
          .length === 0
      ) {
        throw new AppError(
          "At least one progress field must be provided.",
          400
        );
      }

      /*
        Upsert progress record.

        If it doesn't exist:
          create it.

        If it exists:
          update it.
      */
      const progress =
        await Progress.findOneAndUpdate(
          {
            user:
              req.user._id,

            course:
              course._id,

            lesson:
              lesson._id
          },
          updateData,
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert:
              true,
            runValidators: true
          }
        );

      res.status(200).json({
        success: true,
        message:
          "Lesson progress updated successfully.",
        data: progress
      });
    }
  );


/*
  GET /api/progress/course/:courseId

  Get overall progress for a course.
*/
export const getCourseProgress =
  asyncHandler(
    async (req, res) => {
      const { courseId } =
        req.params;

      const course =
        await verifyCourseOwnership(
          courseId,
          req.user._id
        );

      /*
        Find all modules.
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
        Find all lessons.
      */
      let totalLessons = 0;

      if (
        moduleIds.length > 0
      ) {
        totalLessons =
          await Lesson.countDocuments({
            module: {
              $in: moduleIds
            }
          });
      }

      /*
        Find completed progress.
      */
      const progressRecords =
        await Progress.find({
          user:
            req.user._id,

          course:
            course._id
        });

      const completedLessons =
        progressRecords.filter(
          (progress) =>
            progress.completed ===
            true
        ).length;

      /*
        Calculate percentage.
      */
      const percentage =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons /
                totalLessons) *
                100
            );

      res.status(200).json({
        success: true,
        data: {
          courseId:
            course._id,

          totalLessons,

          completedLessons,

          percentage,

          progress:
            progressRecords
        }
      });
    }
  );


/*
  GET /api/progress/lesson/:lessonId

  Get progress for a specific lesson.
*/
export const getLessonProgress =
  asyncHandler(
    async (req, res) => {
      const { lessonId } =
        req.params;

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

      /*
        Find lesson.
      */
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

      /*
        Find parent module.
      */
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

      /*
        Verify course ownership.
      */
      const course =
        await Course.findOne({
          _id: module.course,
          creator: req.user._id
        });

      if (!course) {
        throw new AppError(
          "Lesson not found.",
          404
        );
      }

      /*
        Find progress record.
      */
      const progress =
        await Progress.findOne({
          user:
            req.user._id,

          course:
            course._id,

          lesson:
            lesson._id
        });

      /*
        If no progress exists,
        return a default state.
      */
      if (!progress) {
        return res.status(200).json({
          success: true,
          data: {
            lessonId:
              lesson._id,

            courseId:
              course._id,

            completed:
              false,

            completedAt:
              null,

            quizScore:
              null
          }
        });
      }

      res.status(200).json({
        success: true,
        data: progress
      });
    }
  );