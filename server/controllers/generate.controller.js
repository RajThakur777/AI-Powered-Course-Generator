import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
  generateCourseOutline,
  generateLessonContent
} from "../services/courseGeneration.service.js";


/*
  POST /api/generate/course

  Generate a complete course outline using Gemini.
*/
export const generateCourse = asyncHandler(
  async (req, res) => {
    const { topic } = req.body;

    if (
      !topic ||
      typeof topic !== "string" ||
      topic.trim().length === 0
    ) {
      throw new AppError(
        "Course topic is required.",
        400
      );
    }

    const trimmedTopic = topic.trim();

    const course =
      await generateCourseOutline(
        trimmedTopic
      );

    res.status(200).json({
      success: true,
      message:
        "Course generated successfully.",
      data: course
    });
  }
);


/*
  POST /api/generate/lesson

  Generate detailed lesson content using Gemini.

  Request body:

  {
    "courseId": "...",
    "moduleId": "...",
    "lessonTitle": "Introduction to Variables"
  }
*/
export const generateLesson = asyncHandler(
  async (req, res) => {
    const {
      courseId,
      moduleId,
      lessonTitle
    } = req.body;

    if (
      !courseId ||
      !moduleId ||
      !lessonTitle
    ) {
      throw new AppError(
        "courseId, moduleId and lessonTitle are required.",
        400
      );
    }

    /*
      Validate MongoDB ObjectIds.
    */
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

    /*
      Validate lesson title.
    */
    if (
      typeof lessonTitle !== "string"
    ) {
      throw new AppError(
        "Lesson title must be a string.",
        400
      );
    }

    const trimmedLessonTitle =
      lessonTitle.trim();

    if (
      trimmedLessonTitle.length < 3
    ) {
      throw new AppError(
        "Lesson title must contain at least 3 characters.",
        400
      );
    }

    if (
      trimmedLessonTitle.length > 200
    ) {
      throw new AppError(
        "Lesson title cannot exceed 200 characters.",
        400
      );
    }

    /*
      Verify that the course belongs
      to the authenticated user.
    */
    const course = await Course.findOne({
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
      Verify that the module belongs
      to the selected course.
    */
    const module = await Module.findOne({
      _id: moduleId,
      course: course._id
    });

    if (!module) {
      throw new AppError(
        "Module not found or does not belong to this course.",
        404
      );
    }

    /*
      Generate lesson content.
    */
    const lesson =
      await generateLessonContent({
        courseId:
          course._id.toString(),

        moduleId:
          module._id.toString(),

        lessonTitle:
          trimmedLessonTitle
      });

    res.status(200).json({
      success: true,
      message:
        "Lesson generated successfully.",
      data: lesson
    });
  }
);