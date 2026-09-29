import { z } from "zod";

/*
|--------------------------------------------------------------------------
| MongoDB ObjectId
|--------------------------------------------------------------------------
*/

const objectIdSchema = z
  .string({
    error: "ID must be a string."
  })
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId."
  );


/*
|--------------------------------------------------------------------------
| Generate Course
|--------------------------------------------------------------------------
*/

export const generateCourseSchema =
  z.object({
    topic: z
      .string({
        error:
          "Topic must be a string."
      })
      .trim()
      .min(
        3,
        "Topic must contain at least 3 characters."
      )
      .max(
        500,
        "Topic cannot exceed 500 characters."
      )
  });


/*
|--------------------------------------------------------------------------
| Generate Lesson
|--------------------------------------------------------------------------
*/

export const generateLessonSchema =
  z.object({
    courseId:
      objectIdSchema
        .refine(
          (value) =>
            value.length === 24,
          {
            message:
              "Invalid course ID."
          }
        ),

    moduleId:
      objectIdSchema
        .refine(
          (value) =>
            value.length === 24,
          {
            message:
              "Invalid module ID."
          }
        ),

    lessonTitle: z
      .string({
        error:
          "Lesson title must be a string."
      })
      .trim()
      .min(
        3,
        "Lesson title must contain at least 3 characters."
      )
      .max(
        200,
        "Lesson title cannot exceed 200 characters."
      )
  });
