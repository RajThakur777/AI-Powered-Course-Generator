import mongoose from "mongoose";

import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

import {
  generateLessonAudioFile
} from "../services/audio.service.js";


/*
  Helper function

  Verify lesson ownership.
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
  POST /api/audio/lesson/:lessonId

  Generate TTS audio for the lesson's
  Hinglish text.
*/
export const generateLessonAudio =
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

      /*
        TTS requires Hinglish text.
      */
      if (
        !lesson.hinglishText ||
        lesson.hinglishText.trim()
          .length === 0
      ) {
        throw new AppError(
          "Hinglish translation is required before generating audio.",
          400
        );
      }

      /*
        Generate audio file.
      */
      const audio =
        await generateLessonAudioFile({
          lessonId:
            lesson._id.toString(),
          text:
            lesson.hinglishText
        });

      /*
        Save audio URL.
      */
      lesson.audioUrl =
        audio.audioUrl;

      await lesson.save();

      res.status(200).json({
        success: true,
        message:
          "Lesson audio generated successfully.",
        data: {
          lessonId:
            lesson._id,
          audioUrl:
            lesson.audioUrl,
          fileName:
            audio.fileName
        }
      });
    }
  );


/*
  GET /api/audio/lesson/:lessonId

  Get existing audio URL.
*/
export const getLessonAudio =
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

      if (
        !lesson.audioUrl ||
        lesson.audioUrl.trim()
          .length === 0
      ) {
        throw new AppError(
          "Audio has not been generated for this lesson yet.",
          404
        );
      }

      res.status(200).json({
        success: true,
        data: {
          lessonId:
            lesson._id,
          audioUrl:
            lesson.audioUrl
        }
      });
    }
  );