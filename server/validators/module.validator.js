import { z } from "zod";


/*
|--------------------------------------------------------------------------
| Create Module
|--------------------------------------------------------------------------
*/

export const createModuleSchema =
  z.object({
    title: z
      .string({
        error:
          "Module title must be a string."
      })
      .trim()
      .min(
        3,
        "Module title must contain at least 3 characters."
      )
      .max(
        200,
        "Module title cannot exceed 200 characters."
      ),

    description: z
      .string({
        error:
          "Module description must be a string."
      })
      .trim()
      .max(
        2000,
        "Module description cannot exceed 2000 characters."
      )
      .optional(),

    order: z
      .number({
        error:
          "Module order must be a number."
      })
      .int(
        "Module order must be an integer."
      )
      .nonnegative(
        "Module order must be a non-negative integer."
      )
  });


/*
|--------------------------------------------------------------------------
| Update Module
|--------------------------------------------------------------------------
*/

export const updateModuleSchema =
  z
    .object({
      title: z
        .string({
          error:
            "Module title must be a string."
        })
        .trim()
        .min(
          3,
          "Module title must contain at least 3 characters."
        )
        .max(
          200,
          "Module title cannot exceed 200 characters."
        )
        .optional(),

      description: z
        .string({
          error:
            "Module description must be a string."
        })
        .trim()
        .max(
          2000,
          "Module description cannot exceed 2000 characters."
        )
        .optional(),

      order: z
        .number({
          error:
            "Module order must be a number."
        })
        .int(
          "Module order must be an integer."
        )
        .nonnegative(
          "Module order must be a non-negative integer."
        )
        .optional()
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field is required to update the module."
      }
    );