import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";


/*
  ============================================================
  GEMINI CLIENT
  ============================================================
*/

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey
});


/*
  ============================================================
  HELPERS
  ============================================================
*/

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const isRetryableError = (error) => {
  const status = error?.status || error?.code;

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    status === 504
  );
};


/*
  ============================================================
  GENERATE STRUCTURED JSON CONTENT
  ============================================================
*/

export const generateStructuredContent = async ({
  model = env.geminiModel,
  prompt,
  responseSchema
}) => {

  try {

    /*
      Validate API key
    */
    if (!env.geminiApiKey) {
      throw new AppError(
        "Gemini API key is not configured.",
        500
      );
    }


    /*
      Validate prompt
    */
    if (
      !prompt ||
      typeof prompt !== "string" ||
      prompt.trim().length === 0
    ) {
      throw new AppError(
        "Gemini prompt is required.",
        400
      );
    }


    /*
      Validate response schema
    */
    if (
      !responseSchema ||
      typeof responseSchema !== "object"
    ) {
      throw new AppError(
        "Gemini response schema is required.",
        500
      );
    }


    /*
      Models to try
    */

    const models = [
      model,
      env.geminiFallbackModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ].filter(
      (value, index, array) =>
        value &&
        array.indexOf(value) === index
    );


    let lastError = null;


    /*
      Try primary + fallback model
    */

    for (const currentModel of models) {

      console.log(
        `Attempting Gemini structured generation using model: ${currentModel}`
      );


      /*
        Retry each model twice
      */

      for (let attempt = 1; attempt <= 2; attempt++) {

        try {

          const response =
            await ai.models.generateContent({
              model: currentModel,

              contents: prompt.trim(),

              config: {
                responseMimeType:
                  "application/json",

                responseSchema,

                maxOutputTokens: 8192
              }
            });


          const text =
            response?.text;


          if (
            !text ||
            text.trim().length === 0
          ) {
            throw new AppError(
              "Gemini returned an empty response.",
              502
            );
          }


          // Strip markdown code fences if model returned ```json ... ```
          let cleanedText = text.trim();
          if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.slice(7);
          } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.slice(3);
          }
          if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.slice(0, -3);
          }
          cleanedText = cleanedText.trim();

          /*
            Parse JSON
          */
          try {
            return JSON.parse(cleanedText);
          } catch (parseError) {
            console.error(
              `Gemini JSON parsing failed for ${currentModel} on attempt ${attempt}:`,
              parseError.message
            );
            // Don't throw AppError immediately so it can retry or try next model
            throw new Error(`Invalid JSON: ${parseError.message}`);
          }

        } catch (error) {
          lastError = error;

          console.error(
            `Gemini attempt ${attempt} failed for ${currentModel}:`,
            error?.message || error
          );

          /*
            If this was the last attempt for this model, break out to try the next model
          */
          if (attempt >= 2) {
            break;
          }

          /*
            Exponential backoff before retry on same model
          */
          const delay = attempt === 1 ? 1500 : 3000;
          console.log(`Retrying ${currentModel} in ${delay}ms...`);
          await sleep(delay);
        }
      }


      /*
        Primary model failed.
        Move to fallback model.
      */

      console.log(
        `Model ${currentModel} unavailable. Trying next model...`
      );
    }


    /*
      All models failed
    */

    console.error(
      "All Gemini models failed:",
      lastError
    );


    throw new AppError(
      "Gemini service is temporarily unavailable. Please try again later.",
      503
    );


  } catch (error) {

    /*
      Preserve AppError
    */

    if (
      error instanceof AppError
    ) {
      throw error;
    }


    console.error(
      "Gemini structured content error:",
      error
    );


    throw new AppError(
      "Failed to generate structured content using Gemini.",
      502
    );
  }
};


/*
  ============================================================
  GENERATE PLAIN TEXT
  ============================================================
*/

export const generateText = async ({
  model = env.geminiModel,
  prompt
}) => {

  try {

    /*
      Validate API key
    */

    if (!env.geminiApiKey) {
      throw new AppError(
        "Gemini API key is not configured.",
        500
      );
    }


    /*
      Validate prompt
    */

    if (
      !prompt ||
      typeof prompt !== "string" ||
      prompt.trim().length === 0
    ) {
      throw new AppError(
        "Gemini prompt is required.",
        400
      );
    }


    /*
      Models to try
    */

    const models = [
      model,
      env.geminiFallbackModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ].filter(
      (value, index, array) =>
        value &&
        array.indexOf(value) === index
    );


    let lastError = null;


    /*
      Try models
    */

    for (const currentModel of models) {

      console.log(
        `Attempting Gemini text generation using model: ${currentModel}`
      );


      for (let attempt = 1; attempt <= 2; attempt++) {

        try {

          const response =
            await ai.models.generateContent({
              model: currentModel,
              contents: prompt.trim()
            });


          const text =
            response?.text;


          if (
            !text ||
            text.trim().length === 0
          ) {
            throw new AppError(
              "Gemini returned an empty response.",
              502
            );
          }


          return text.trim();


        } catch (error) {

          lastError = error;


          console.error(
            `Gemini text attempt ${attempt} failed for ${currentModel}:`,
            error?.message || error
          );


          if (error instanceof AppError) {
            throw error;
          }


          if (!isRetryableError(error)) {
            throw error;
          }


          if (attempt < 2) {

            const delay =
              attempt === 1
                ? 1500
                : 3000;

            console.log(
              `Retrying ${currentModel} in ${delay}ms...`
            );

            await sleep(delay);
          }
        }
      }
    }


    console.error(
      "All Gemini text models failed:",
      lastError
    );


    throw new AppError(
      "Gemini service is temporarily unavailable. Please try again later.",
      503
    );


  } catch (error) {

    if (
      error instanceof AppError
    ) {
      throw error;
    }


    console.error(
      "Gemini text generation error:",
      error
    );


    throw new AppError(
      "Failed to generate text using Gemini.",
      502
    );
  }
};


/*
  ============================================================
  EXPORT GEMINI CLIENT
  ============================================================
*/

export { ai };