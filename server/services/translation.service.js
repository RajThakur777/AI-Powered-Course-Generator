import {
  generateText
} from "./gemini.service.js";

import AppError from "../utils/AppError.js";


/*
  ============================================================
  CONVERT LESSON TO TEXT
  ============================================================
*/

const convertLessonToText =
  (lesson) => {
    if (!lesson) {
      return "";
    }


    const sections = [];


    /*
      Lesson title.
    */
    if (lesson.title) {
      sections.push(
        `Lesson Title: ${lesson.title}`
      );
    }


    /*
      Objectives.
    */
    if (
      Array.isArray(
        lesson.objectives
      ) &&
      lesson.objectives.length > 0
    ) {
      sections.push(
        `Learning Objectives:\n${lesson.objectives
          .map(
            (item) =>
              `- ${item}`
          )
          .join("\n")}`
      );
    }


    /*
      Key topics.
    */
    if (
      Array.isArray(
        lesson.keyTopics
      ) &&
      lesson.keyTopics.length > 0
    ) {
      sections.push(
        `Key Topics:\n${lesson.keyTopics
          .map(
            (item) =>
              `- ${item}`
          )
          .join("\n")}`
      );
    }


    /*
      Main lesson content.
    */
    if (
      Array.isArray(
        lesson.content
      )
    ) {
      for (
        const block of lesson.content
      ) {
        if (
          block.type ===
            "heading" ||
          block.type ===
            "paragraph" ||
          block.type ===
            "callout"
        ) {
          if (block.text) {
            sections.push(
              block.text
            );
          }
        }


        /*
          Code.

          We include code in the source
          context but explicitly tell
          Gemini not to translate it.
        */
        if (
          block.type ===
          "code"
        ) {
          sections.push(
            `Code Example (${block.language || "code"}):\n${block.text || ""}`
          );
        }


        /*
          List.
        */
        if (
          block.type ===
          "list"
        ) {
          if (
            Array.isArray(
              block.items
            )
          ) {
            sections.push(
              block.items
                .map(
                  (item) =>
                    `- ${item}`
                )
                .join("\n")
            );
          }
        }


        /*
          MCQ.
        */
        if (
          block.type ===
          "mcq"
        ) {
          sections.push(
            `Question: ${
              block.text || ""
            }\n` +

            `Options:\n${
              block.options
                ?.map(
                  (option, index) =>
                    `${index + 1}. ${option}`
                )
                .join("\n") ||
              ""
            }\n` +

            `Explanation: ${
              block.explanation ||
              ""
            }`
          );
        }


        /*
          Video block.

          Translate the educational
          context but don't translate
          the search query.
        */
        if (
          block.type ===
          "video"
        ) {
          sections.push(
            `Recommended Video Topic: ${
              block.query || ""
            }`
          );
        }
      }
    }


    /*
      Suggested readings.

      We include title and description,
      but URLs are preserved separately.
    */
    if (
      Array.isArray(
        lesson.readings
      ) &&
      lesson.readings.length > 0
    ) {
      sections.push(
        `Suggested Readings:\n${lesson.readings
          .map(
            (reading) =>
              `- ${reading.title || ""}${
                reading.author
                  ? ` by ${reading.author}`
                  : ""
              }: ${
                reading.description || ""
              }`
          )
          .join("\n")}`
      );
    }


    /*
      External links.

      Again, don't translate URLs.
    */
    if (
      Array.isArray(
        lesson.externalLinks
      ) &&
      lesson.externalLinks.length > 0
    ) {
      sections.push(
        `External Resources:\n${lesson.externalLinks
          .map(
            (link) =>
              `- ${
                link.title || ""
              }${
                link.source
                  ? ` (${link.source})`
                  : ""
              }`
          )
          .join("\n")}`
      );
    }


    return sections
      .filter(
        (section) =>
          section &&
          section.trim()
      )
      .join("\n\n");
  };


/*
  ============================================================
  TRANSLATE LESSON TO HINGLISH
  ============================================================
*/

export const translateToHinglish =
  async ({
    lesson
  }) => {
    if (!lesson) {
      throw new AppError(
        "Lesson is required for translation.",
        400
      );
    }


    const lessonText =
      convertLessonToText(
        lesson
      );


    if (
      !lessonText ||
      lessonText.trim().length === 0
    ) {
      throw new AppError(
        "Lesson does not contain enough content to translate.",
        400
      );
    }


    const prompt = `
You are an expert Indian technical educator.

Convert the following English educational
lesson into natural Hinglish.

Hinglish means a natural combination of
English and Hindi written entirely using
Roman script.

IMPORTANT RULES:

1. Preserve all technical terminology
   in English when that is more natural.

2. Do NOT translate programming keywords.

3. Do NOT translate code.

4. Preserve code examples exactly.

5. Explain difficult concepts using
   simple conversational Hindi + English.

6. The result should sound natural when
   spoken by an Indian educator.

7. Do not use Devanagari script.

8. Do not add unrelated information.

9. Preserve the original meaning.

10. Make the explanation beginner-friendly.

11. Do not translate URLs.

12. Keep technical names, API names,
    programming languages, libraries,
    frameworks and commands in English
    where appropriate.

13. Do not create new facts.

14. Return only the Hinglish explanation.

LESSON:

${lessonText}
`;


    const result =
      await generateText({
        prompt
      });


    if (
      !result ||
      result.trim().length === 0
    ) {
      throw new AppError(
        "Gemini returned an empty Hinglish translation.",
        502
      );
    }


    return result.trim();
  };
