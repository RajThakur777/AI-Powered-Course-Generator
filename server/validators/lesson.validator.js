import { z } from "zod";


/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const nonEmptyText = (
  message
) =>
  z
    .string({
      error: message
    })
    .trim()
    .min(
      1,
      message
    );


const urlSchema =
  z
    .string({
      error:
        "URL must be a string."
    })
    .trim()
    .url(
      "Please provide a valid URL."
    );


/*
|--------------------------------------------------------------------------
| Content Block: Heading
|--------------------------------------------------------------------------
*/

const headingBlockSchema =
  z.object({
    type:
      z.literal("heading"),

    text:
      nonEmptyText(
        "Heading text cannot be empty."
      )
  });


/*
|--------------------------------------------------------------------------
| Content Block: Paragraph
|--------------------------------------------------------------------------
*/

const paragraphBlockSchema =
  z.object({
    type:
      z.literal("paragraph"),

    text:
      nonEmptyText(
        "Paragraph text cannot be empty."
      )
  });


/*
|--------------------------------------------------------------------------
| Content Block: Code
|--------------------------------------------------------------------------
*/

const codeBlockSchema =
  z.object({
    type:
      z.literal("code"),

    language:
      nonEmptyText(
        "Code language is required."
      ),

    text:
      z
        .string({
          error:
            "Code must be a string."
        })
        .min(
          1,
          "Code cannot be empty."
        )
  });


/*
|--------------------------------------------------------------------------
| Content Block: Video
|--------------------------------------------------------------------------
*/

const videoBlockSchema =
  z.object({
    type:
      z.literal("video"),

    query:
      z.string().max(300).optional().or(z.literal("")),
      
    url:
      z.string().optional()
  });


/*
|--------------------------------------------------------------------------
| Content Block: MCQ
|--------------------------------------------------------------------------
*/

const mcqBlockSchema =
  z
    .object({
      type:
        z.literal("mcq"),

      text:
        z.string().optional().or(z.literal("")),

      options:
        z.array(z.string()).optional(),

      answer:
        z.union([z.number(), z.string()]).optional(),

      explanation:
        z.string().optional().or(z.literal(""))
    });


/*
|--------------------------------------------------------------------------
| Content Block: List
|--------------------------------------------------------------------------
*/

const listBlockSchema =
  z.object({
    type:
      z.literal("list"),

    items:
      z
        .array(
          z
            .string()
            .trim()
            .min(
              1,
              "List item cannot be empty."
            )
        )
        .min(
          1,
          "List must contain at least one item."
        )
        .max(
          50,
          "List cannot contain more than 50 items."
        )
  });


/*
|--------------------------------------------------------------------------
| Content Block: Callout
|--------------------------------------------------------------------------
*/

const calloutBlockSchema =
  z.object({
    type:
      z.literal("callout"),

    text:
      nonEmptyText(
        "Callout text cannot be empty."
      )
  });


/*
|--------------------------------------------------------------------------
| Combined Content Block
|--------------------------------------------------------------------------
*/

export const contentBlockSchema =
  z.discriminatedUnion(
    "type",
    [
      headingBlockSchema,
      paragraphBlockSchema,
      codeBlockSchema,
      videoBlockSchema,
      mcqBlockSchema,
      listBlockSchema,
      calloutBlockSchema
    ]
  );


/*
|--------------------------------------------------------------------------
| Suggested Reading
|--------------------------------------------------------------------------
*/

const readingSchema =
  z.object({
    title:
      z
        .string({
          error:
            "Reading title must be a string."
        })
        .trim()
        .min(
          1,
          "Reading title cannot be empty."
        )
        .max(
          300,
          "Reading title cannot exceed 300 characters."
        ),

    author:
      z
        .string({
          error:
            "Reading author must be a string."
        })
        .trim()
        .max(
          200,
          "Reading author cannot exceed 200 characters."
        )
        .optional(),

    url:
      urlSchema,

    description:
      z
        .string({
          error:
            "Reading description must be a string."
        })
        .trim()
        .max(
          2000,
          "Reading description cannot exceed 2000 characters."
        )
        .optional()
  });


/*
|--------------------------------------------------------------------------
| External Learning Resource
|--------------------------------------------------------------------------
*/

const externalLinkSchema =
  z.object({
    title:
      z
        .string({
          error:
            "External link title must be a string."
        })
        .trim()
        .min(
          1,
          "External link title cannot be empty."
        )
        .max(
          300,
          "External link title cannot exceed 300 characters."
        ),

    url:
      urlSchema,

    source:
      z
        .string({
          error:
            "External link source must be a string."
        })
        .trim()
        .max(
          200,
          "External link source cannot exceed 200 characters."
        )
        .optional()
  });


/*
|--------------------------------------------------------------------------
| Create Lesson
|--------------------------------------------------------------------------
*/

export const createLessonSchema =
  z.object({
    title:
      z
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
        ),

    order:
      z
        .number({
          error:
            "Lesson order must be a number."
        })
        .int(
          "Lesson order must be an integer."
        )
        .nonnegative(
          "Lesson order must be a non-negative integer."
        ),

    objectives:
      z
        .array(
          z
            .string()
            .trim()
            .min(
              1,
              "Objective cannot be empty."
            )
        )
        .max(
          20,
          "A lesson cannot have more than 20 objectives."
        )
        .optional(),

    keyTopics:
      z
        .array(
          z
            .string()
            .trim()
            .min(
              1,
              "Key topic cannot be empty."
            )
        )
        .max(
          30,
          "A lesson cannot have more than 30 key topics."
        )
        .optional(),

    content:
      z
        .array(
          contentBlockSchema
        )
        .max(
          200,
          "Lesson contains too many content blocks."
        )
        .optional(),

    readings:
      z
        .array(
          readingSchema
        )
        .max(
          20,
          "A lesson cannot have more than 20 readings."
        )
        .optional(),

    externalLinks:
      z
        .array(
          externalLinkSchema
        )
        .max(
          20,
          "A lesson cannot have more than 20 external links."
        )
        .optional(),

    videoQuery:
      z
        .string({
          error:
            "Video query must be a string."
        })
        .trim()
        .max(
          300,
          "Video query cannot exceed 300 characters."
        )
        .optional()
  });


/*
|--------------------------------------------------------------------------
| Update Lesson
|--------------------------------------------------------------------------
*/

export const updateLessonSchema =
  z
    .object({
      title:
        z
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
          .optional(),

      order:
        z
          .number({
            error:
              "Lesson order must be a number."
          })
          .int(
            "Lesson order must be an integer."
          )
          .nonnegative(
            "Lesson order must be a non-negative integer."
          )
          .optional(),

      objectives:
        z
          .array(
            z
              .string()
              .trim()
              .min(
                1,
                "Objective cannot be empty."
              )
          )
          .max(
            20,
            "A lesson cannot have more than 20 objectives."
          )
          .optional(),

      keyTopics:
        z
          .array(
            z
              .string()
              .trim()
              .min(
                1,
                "Key topic cannot be empty."
              )
          )
          .max(
            30,
            "A lesson cannot have more than 30 key topics."
          )
          .optional(),

      content:
        z
          .array(
            contentBlockSchema
          )
          .max(
            200,
            "Lesson contains too many content blocks."
          )
          .optional(),

      readings:
        z
          .array(
            readingSchema
          )
          .max(
            20,
            "A lesson cannot have more than 20 readings."
          )
          .optional(),

      externalLinks:
        z
          .array(
            externalLinkSchema
          )
          .max(
            20,
            "A lesson cannot have more than 20 external links."
          )
          .optional(),

      videoQuery:
        z
          .string({
            error:
              "Video query must be a string."
          })
          .trim()
          .max(
            300,
            "Video query cannot exceed 300 characters."
          )
          .optional(),

      isEnriched:
        z.boolean().optional()
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field is required to update the lesson."
      }
    );