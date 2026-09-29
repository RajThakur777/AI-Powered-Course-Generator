import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
  translateToHinglish
} from "../services/translation.service.js";


/*
  POST /api/translation/lesson/:lessonId

  Translate lesson content into
  natural Roman-script Hinglish.
*/
export const translateLesson =
  asyncHandler(
    async (req, res) => {
      const { lessonId } =
        req.params;

      /*
        Validate lesson ID.
      */
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
        Get lesson.
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
        Get parent module.
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
        Translate lesson.
      */
      const hinglishText =
        await translateToHinglish({
          lesson
        });

      if (
        !hinglishText ||
        hinglishText.trim().length === 0
      ) {
        throw new AppError(
          "Translation service returned empty content.",
          502
        );
      }

      /*
        Save translated content.
      */
      lesson.hinglishText =
        hinglishText.trim();

      await lesson.save();

      res.status(200).json({
        success: true,
        message:
          "Lesson translated to Hinglish successfully.",
        data: {
          lessonId:
            lesson._id,
          hinglishText:
            lesson.hinglishText
        }
      });
    }
  );