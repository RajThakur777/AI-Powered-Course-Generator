import { z } from "zod";


/*
|--------------------------------------------------------------------------
| MongoDB ObjectId
|--------------------------------------------------------------------------
*/

const objectIdSchema = (
  fieldName
) =>
  z
    .string({
      error:
        `${fieldName} must be a string.`
    })
    .regex(
      /^[0-9a-fA-F]{24}$/,
      `Invalid ${fieldName.toLowerCase()}.`
    );


/*
|--------------------------------------------------------------------------
| Update Progress
|--------------------------------------------------------------------------
*/

export const updateProgressSchema =
  z
    .object({
      courseId:
        objectIdSchema(
          "Course ID"
        ),

      lessonId:
        objectIdSchema(
          "Lesson ID"
        ),

      completed:
        z
          .boolean({
            error:
              "Completed must be a boolean."
          })
          .optional(),

      quizScore:
        z
          .number({
            error:
              "Quiz score must be a number."
          })
          .min(
            0,
            "Quiz score cannot be less than 0."
          )
          .max(
            100,
            "Quiz score cannot be greater than 100."
          )
          .optional()
    })
    .refine(
      (data) =>
        data.completed !== undefined ||
        data.quizScore !== undefined,
      {
        message:
          "At least one progress field must be provided."
      }
    );