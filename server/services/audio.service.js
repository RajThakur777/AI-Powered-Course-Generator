import fs from "node:fs/promises";
import path from "node:path";

import wav from "wav";

import {
  ai
} from "./gemini.service.js";

import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";


/*
  ============================================================
  AUDIO DIRECTORY
  ============================================================
*/

const audioDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "audio"
  );


/*
  ============================================================
  SAVE PCM BUFFER AS WAV
  ============================================================

  Gemini TTS returns raw PCM audio.

  We convert it to WAV so browsers
  can play the generated file.
*/

const saveWaveFile = (
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) => {
  return new Promise(
    (resolve, reject) => {
      const writer =
        new wav.FileWriter(
          filename,
          {
            channels,

            sampleRate:
              rate,

            bitDepth:
              sampleWidth * 8
          }
        );


      writer.on(
        "finish",
        resolve
      );


      writer.on(
        "error",
        reject
      );


      writer.write(
        pcmData
      );


      writer.end();
    }
  );
};


/*
  ============================================================
  GENERATE LESSON AUDIO
  ============================================================
*/

export const generateLessonAudioFile =
  async ({
    lessonId,
    text
  }) => {
    /*
      Validate Gemini key.
    */
    if (
      !env.geminiApiKey
    ) {
      throw new AppError(
        "Gemini API key is not configured.",
        500
      );
    }


    /*
      Validate lesson ID.
    */
    if (
      !lessonId ||
      typeof lessonId !== "string"
    ) {
      throw new AppError(
        "Lesson ID is required.",
        400
      );
    }


    /*
      Validate text.
    */
    if (
      !text ||
      typeof text !== "string"
    ) {
      throw new AppError(
        "Text is required for audio generation.",
        400
      );
    }


    const trimmedText =
      text.trim();


    if (
      trimmedText.length === 0
    ) {
      throw new AppError(
        "Text cannot be empty.",
        400
      );
    }


    /*
      Prevent accidentally sending
      extremely large text to TTS.
    */
    if (
      trimmedText.length > 50000
    ) {
      throw new AppError(
        "Text is too long for audio generation.",
        400
      );
    }


    try {
      /*
        Create audio directory.
      */
      await fs.mkdir(
        audioDirectory,
        {
          recursive: true
        }
      );


      /*
        Generate audio using Gemini TTS.
      */
      const response =
        await ai.models.generateContent({
          model: env.geminiFallbackModel || "gemini-2.0-flash",

          contents:
            trimmedText,

          config: {
            responseModalities: [
              "AUDIO"
            ],

            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName:
                    "Kore"
                }
              }
            }
          }
        });


      /*
        Gemini returns inline audio
        data encoded as base64.
      */
      const base64Audio =
        response
          ?.candidates?.[0]
          ?.content
          ?.parts
          ?.find(
            (part) =>
              part?.inlineData?.data
          )
          ?.inlineData
          ?.data;


      if (
        !base64Audio
      ) {
        throw new AppError(
          "Gemini did not return audio data.",
          502
        );
      }


      /*
        Convert base64 to Buffer.
      */
      const audioBuffer =
        Buffer.from(
          base64Audio,
          "base64"
        );


      if (
        audioBuffer.length === 0
      ) {
        throw new AppError(
          "Generated audio data is empty.",
          502
        );
      }


      /*
        Create deterministic filename.
      */
      const fileName =
        `lesson-${lessonId}.wav`;


      const filePath =
        path.join(
          audioDirectory,
          fileName
        );


      /*
        Save raw PCM as WAV.

        Gemini TTS PCM:
          Channels: 1
          Sample rate: 24000 Hz
          Sample width: 16-bit
      */
      await saveWaveFile(
        filePath,
        audioBuffer,
        1,
        24000,
        2
      );


      /*
        Public URL.

        app.js exposes /uploads
        as static content.
      */
      const audioUrl =
        `/uploads/audio/${fileName}`;


      return {
        fileName,

        filePath,

        audioUrl
      };
    } catch (error) {
      /*
        Preserve AppError.
      */
      if (
        error instanceof AppError
      ) {
        throw error;
      }


      console.error(
        "Gemini TTS error:",
        error
      );


      throw new AppError(
        "Failed to generate lesson audio.",
        502
      );
    }
  };
