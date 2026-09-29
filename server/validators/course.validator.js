import { z } from "zod";


/*
|--------------------------------------------------------------------------
| Reusable Schemas
|--------------------------------------------------------------------------
*/

const nonEmptyString = (
  message
) =>
  z
    .string({
      error: message
    })
    .trim()
    .min(
      1,
      "Value cannot be empty."
    );


const tagSchema =
  z
    .string({
      error:
        "Each tag must be a string."
    })
    .trim()
    .min(
      1,
      "Course tag cannot be empty."
    )
    .max(
      100,
      "Course tag cannot exceed 100 characters."
    );


/*
|--------------------------------------------------------------------------
| Create Course
|--------------------------------------------------------------------------
*/

export const createCourseSchema =
  z.object({
    title: z
      .string({
        error:
          "Course title must be a string."
      })
      .trim()
      .min(
        3,
        "Course title must contain at least 3 characters."
      )
      .max(
        200,
        "Course title cannot exceed 200 characters."
      ),

    description: z
      .string({
        error:
          "Course description must be a string."
      })
      .trim()
      .min(
        10,
        "Course description is too short."
      )
      .max(
        5000,
        "Course description cannot exceed 5000 characters."
      ),

    originalPrompt: z
      .string({
        error:
          "Original prompt must be a string."
      })
      .trim()
      .min(
        3,
        "Original prompt is required."
      )
      .max(
        1000,
        "Original prompt cannot exceed 1000 characters."
      ),

    tags: z
      .array(tagSchema)
      .max(
        20,
        "A course cannot have more than 20 tags."
      )
      .optional(),

    difficulty: z
      .enum(
        [
          "beginner",
          "intermediate",
          "advanced"
        ],
        {
          error:
            "Difficulty must be beginner, intermediate, or advanced."
        }
      )
      .optional(),

    estimatedDuration: z
      .string({
        error:
          "Estimated duration must be a string."
      })
      .trim()
      .max(
        100,
        "Estimated duration is too long."
      )
      .optional()
  });


/*
|--------------------------------------------------------------------------
| Update Course
|--------------------------------------------------------------------------
*/

export const updateCourseSchema =
  z
    .object({
      title: z
        .string({
          error:
            "Course title must be a string."
        })
        .trim()
        .min(
          3,
          "Course title must contain at least 3 characters."
        )
        .max(
          200,
          "Course title cannot exceed 200 characters."
        )
        .optional(),

      description: z
        .string({
          error:
            "Course description must be a string."
        })
        .trim()
        .min(
          10,
          "Course description is too short."
        )
        .max(
          5000,
          "Course description cannot exceed 5000 characters."
        )
        .optional(),

      tags: z
        .array(tagSchema)
        .max(
          20,
          "A course cannot have more than 20 tags."
        )
        .optional(),

      difficulty: z
        .enum(
          [
            "beginner",
            "intermediate",
            "advanced"
          ],
          {
            error:
              "Difficulty must be beginner, intermediate, or advanced."
          }
        )
        .optional(),

      estimatedDuration: z
        .string({
          error:
            "Estimated duration must be a string."
        })
        .trim()
        .max(
          100,
          "Estimated duration is too long."
        )
        .optional()
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field is required to update the course."
      }
    );