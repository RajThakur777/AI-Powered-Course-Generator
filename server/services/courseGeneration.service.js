import {
  generateStructuredContent
} from "./gemini.service.js";

import AppError from "../utils/AppError.js";


/*
  ============================================================
  COURSE GENERATION SCHEMA
  ============================================================
*/

const courseSchema = {
  type: "object",

  properties: {
    title: {
      type: "string"
    },

    description: {
      type: "string"
    },

    tags: {
      type: "array",
      items: {
        type: "string"
      }
    },

    difficulty: {
      type: "string",
      enum: [
        "beginner",
        "intermediate",
        "advanced"
      ]
    },

    estimatedDuration: {
      type: "string"
    },

    modules: {
      type: "array",

      minItems: 3,
      maxItems: 6,

      items: {
        type: "object",

        properties: {
          title: {
            type: "string"
          },

          description: {
            type: "string"
          },

          order: {
            type: "integer"
          },

          lessons: {
            type: "array",

            minItems: 3,
            maxItems: 5,

            items: {
              type: "object",

              properties: {
                title: {
                  type: "string"
                },

                order: {
                  type: "integer"
                }
              },

              required: [
                "title",
                "order"
              ]
            }
          }
        },

        required: [
          "title",
          "description",
          "order",
          "lessons"
        ]
      }
    }
  },

  required: [
    "title",
    "description",
    "tags",
    "difficulty",
    "estimatedDuration",
    "modules"
  ]
};


/*
  ============================================================
  LESSON GENERATION SCHEMA
  ============================================================
*/

const lessonSchema = {
  type: "object",

  properties: {
    title: {
      type: "string"
    },

    objectives: {
      type: "array",
      items: {
        type: "string"
      }
    },

    keyTopics: {
      type: "array",
      items: {
        type: "string"
      }
    },

    videoQuery: {
      type: "string"
    },

    /*
      Suggested readings.
    */
    readings: {
      type: "array",

      items: {
        type: "object",

        properties: {
          title: {
            type: "string"
          },

          author: {
            type: "string"
          },

          url: {
            type: "string"
          },

          description: {
            type: "string"
          }
        },

        required: [
          "title",
          "url",
          "description"
        ]
      }
    },

    /*
      External learning resources.
    */
    externalLinks: {
      type: "array",

      items: {
        type: "object",

        properties: {
          title: {
            type: "string"
          },

          url: {
            type: "string"
          },

          source: {
            type: "string"
          }
        },

        required: [
          "title",
          "url",
          "source"
        ]
      }
    },

    /*
      Rich lesson content.
    */
    content: {
      type: "array",

      items: {
        type: "object",

        properties: {
          type: {
            type: "string",

            enum: [
              "heading",
              "paragraph",
              "code",
              "video",
              "mcq",
              "list",
              "callout"
            ]
          },

          text: {
            type: "string"
          },

          language: {
            type: "string"
          },

          query: {
            type: "string"
          },

          url: {
            type: "string"
          },

          options: {
            type: "array",

            items: {
              type: "string"
            }
          },

          answer: {
            type: "integer"
          },

          explanation: {
            type: "string"
          },

          items: {
            type: "array",

            items: {
              type: "string"
            }
          }
        },

        required: [
          "type"
        ]
      }
    }
  },

  required: [
    "title",
    "objectives",
    "keyTopics",
    "videoQuery",
    "readings",
    "externalLinks",
    "content"
  ]
};


/*
  ============================================================
  GENERATE COURSE OUTLINE
  ============================================================
*/

export const generateCourseOutline =
  async (topic) => {
    /*
      Validate topic.
    */
    if (
      !topic ||
      typeof topic !== "string"
    ) {
      throw new AppError(
        "A valid course topic is required.",
        400
      );
    }

    const trimmedTopic =
      topic.trim();


    if (
      trimmedTopic.length < 3
    ) {
      throw new AppError(
        "Course topic must contain at least 3 characters.",
        400
      );
    }


    if (
      trimmedTopic.length > 500
    ) {
      throw new AppError(
        "Course topic cannot exceed 500 characters.",
        400
      );
    }


    /*
      Instructional design prompt.
    */
    const prompt = `
You are an expert instructional designer
and technical educator.

Create a complete online course outline
for the following topic:

"${trimmedTopic}"

TARGET LEARNER:

The target learner is a beginner-to-intermediate
student unless the topic naturally requires
another difficulty level.

COURSE REQUIREMENTS:

1. Create a clear and engaging course title.

2. Write a useful course description.

3. Generate 3-8 relevant tags.

4. Select exactly one difficulty:
   - beginner
   - intermediate
   - advanced

5. Estimate the total learning duration.

6. Create between 3 and 6 modules.

7. Each module must contain between
   3 and 5 lessons.

8. Arrange modules and lessons in a logical
   learning progression.

9. Lesson titles must be specific,
   educational and meaningful.

10. Avoid unnecessary repetition between
    modules and lessons.

11. Do NOT generate detailed lesson content yet.

12. Do NOT generate YouTube URLs.

13. Return only JSON.

14. Follow the supplied response schema exactly.

The goal is to create a high-quality course
structure that can later be expanded into
individual detailed lessons.
`;


    const course =
      await generateStructuredContent({
        prompt,

        responseSchema:
          courseSchema
      });


    /*
      Basic validation of generated result.
    */
    if (
      !course ||
      typeof course !== "object"
    ) {
      throw new AppError(
        "Gemini generated an invalid course.",
        502
      );
    }


    if (
      !Array.isArray(
        course.modules
      )
    ) {
      throw new AppError(
        "Gemini generated an invalid module structure.",
        502
      );
    }


    if (
      course.modules.length < 3 ||
      course.modules.length > 6
    ) {
      throw new AppError(
        "Generated course must contain between 3 and 6 modules.",
        502
      );
    }


    return course;
  };


/*
  ============================================================
  GENERATE INDIVIDUAL LESSON
  ============================================================

  The function accepts course/module context
  so Gemini can create content that actually
  belongs to the correct learning progression.

  Parameters:

  courseId
  courseTitle
  courseDescription
  moduleId
  moduleTitle
  moduleDescription
  lessonTitle
*/

export const generateLessonContent =
  async ({
    courseId,
    courseTitle,
    courseDescription,
    moduleId,
    moduleTitle,
    moduleDescription,
    lessonTitle
  }) => {
    /*
      Lesson title is mandatory.
    */
    if (
      !lessonTitle ||
      typeof lessonTitle !== "string"
    ) {
      throw new AppError(
        "Lesson title is required.",
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
      Course/module context.

      These are optional for backward
      compatibility, but the controller
      should provide them.
    */
    const safeCourseTitle =
      courseTitle || "Not provided";

    const safeCourseDescription =
      courseDescription || "Not provided";

    const safeModuleTitle =
      moduleTitle || "Not provided";

    const safeModuleDescription =
      moduleDescription || "Not provided";


    const prompt = `
You are an expert technical educator.

Generate a complete educational lesson.

COURSE CONTEXT:

Course:
"${safeCourseTitle}"

Course Description:
"${safeCourseDescription}"

Course ID:
${courseId || "Not provided"}

MODULE CONTEXT:

Module:
"${safeModuleTitle}"

Module Description:
"${safeModuleDescription}"

Module ID:
${moduleId || "Not provided"}

LESSON:

"${trimmedLessonTitle}"


IMPORTANT:

The lesson must fit naturally inside
the specified course and module.

Do not repeat the entire course.
Focus specifically on the requested lesson.


LESSON REQUIREMENTS:

1. Generate 3-6 clear learning objectives.

2. Generate 4-8 key topics.

3. Generate rich educational content
   using structured content blocks.

4. Supported content block types:

   heading
   paragraph
   code
   video
   mcq
   list
   callout

5. Use code examples when the lesson
   involves programming, algorithms,
   databases, APIs, or other technical
   concepts where code is useful.

6. Code blocks must contain:
   - type = "code"
   - language
   - text

7. Video blocks must contain a useful
   YouTube SEARCH QUERY.

8. Do NOT invent YouTube video URLs.

9. Generate one useful video search query
   in videoQuery.

10. Include 4-5 MCQs near the end
    of the lesson.

11. Every MCQ must contain:
    - type = "mcq"
    - text
    - options
    - answer
    - explanation

12. The answer field is a zero-based index.

13. Generate useful suggested readings.

14. Each reading should contain:
    - title
    - URL
    - description
    - author when known

15. Prefer authoritative resources such as:
    - official documentation
    - reputable books
    - university resources
    - well-known educational websites

16. Generate useful external links when
    appropriate.

17. External links should contain:
    - title
    - URL
    - source

18. Do not generate fake or obviously
    fabricated URLs.

19. Do not use Markdown formatting
    inside content text.

20. Do not wrap the response in code fences.

21. Return only valid JSON.

22. Follow the supplied JSON schema exactly.

23. The lesson should teach the concept
    thoroughly rather than merely summarizing it.
`;


    const lesson =
      await generateStructuredContent({
        prompt,

        responseSchema:
          lessonSchema
      });


    /*
      Basic response validation.
    */
    if (
      !lesson ||
      typeof lesson !== "object"
    ) {
      throw new AppError(
        "Gemini generated an invalid lesson.",
        502
      );
    }


    if (
      !Array.isArray(
        lesson.objectives
      )
    ) {
      throw new AppError(
        "Generated lesson objectives are invalid.",
        502
      );
    }


    if (
      !Array.isArray(
        lesson.keyTopics
      )
    ) {
      throw new AppError(
        "Generated lesson key topics are invalid.",
        502
      );
    }


    if (
      !Array.isArray(
        lesson.content
      )
    ) {
      throw new AppError(
        "Generated lesson content is invalid.",
        502
      );
    }


    return lesson;
  };
