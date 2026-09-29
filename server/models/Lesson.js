import mongoose from "mongoose";


/*
  ============================================================
  CONTENT BLOCK SCHEMA
  ============================================================

  A lesson is composed of multiple content blocks.

  Supported types:

  heading
  paragraph
  code
  video
  mcq
  list
  callout
*/


const contentBlockSchema =
  new mongoose.Schema(
    {
      /*
        Content block type.
      */
      type: {
        type: String,
        enum: [
          "heading",
          "paragraph",
          "code",
          "video",
          "mcq",
          "list",
          "callout"
        ],
        required: true
      },

      /*
        Used by:
        heading
        paragraph
        video (optional)
        callout
        mcq question
      */
      text: {
        type: String,
        trim: true
      },

      /*
        Programming language
        for code blocks.

        Example:
        javascript
        python
        cpp
      */
      language: {
        type: String,
        trim: true
      },

      /*
        YouTube search query
        for video blocks.

        Example:
        "JavaScript promises explained"
      */
      query: {
        type: String,
        trim: true
      },

      /*
        Optional URL.

        Useful for video/resource
        references when required.
      */
      url: {
        type: String,
        trim: true
      },

      /*
        MCQ options.
      */
      options: [
        {
          type: String,
          trim: true
        }
      ],

      /*
        Zero-based index of the
        correct MCQ answer.

        Example:

        options:
        [
          "HTML",
          "CSS",
          "JavaScript"
        ]

        answer: 2
      */
      answer: {
        type: Number,
        min: 0
      },

      /*
        Explanation for the
        correct MCQ answer.
      */
      explanation: {
        type: String,
        trim: true
      },

      /*
        Items for list blocks.
      */
      items: [
        {
          type: String,
          trim: true
        }
      ]
    },
    {
      _id: false
    }
  );


/*
  ============================================================
  READING RESOURCE SCHEMA
  ============================================================
*/


const readingSchema =
  new mongoose.Schema(
    {
      /*
        Name/title of the reading.
      */
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },

      /*
        Optional author/source.
      */
      author: {
        type: String,
        trim: true,
        default: ""
      },

      /*
        URL of the reading.
      */
      url: {
        type: String,
        required: true,
        trim: true
      },

      /*
        Short description explaining
        why the resource is useful.
      */
      description: {
        type: String,
        trim: true,
        default: ""
      }
    },
    {
      _id: false
    }
  );


/*
  ============================================================
  EXTERNAL LINK SCHEMA
  ============================================================
*/


const externalLinkSchema =
  new mongoose.Schema(
    {
      /*
        Display name of the link.
      */
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },

      /*
        URL.
      */
      url: {
        type: String,
        required: true,
        trim: true
      },

      /*
        Type/source of resource.

        Examples:
        documentation
        tutorial
        article
        official
        reference
      */
      source: {
        type: String,
        trim: true,
        default: ""
      }
    },
    {
      _id: false
    }
  );


/*
  ============================================================
  VIDEO SCHEMA
  ============================================================
*/


const videoSchema =
  new mongoose.Schema(
    {
      videoId: {
        type: String,
        trim: true
      },

      title: {
        type: String,
        trim: true
      },

      channelTitle: {
        type: String,
        trim: true
      },

      thumbnail: {
        type: String,
        trim: true
      },

      url: {
        type: String,
        trim: true
      }
    },
    {
      _id: false
    }
  );


/*
  ============================================================
  LESSON SCHEMA
  ============================================================
*/


const lessonSchema =
  new mongoose.Schema(
    {
      /*
        Lesson title.
      */
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
      },

      /*
        Position inside the module.
      */
      order: {
        type: Number,
        required: true,
        min: 0
      },

      /*
        Learning objectives.
      */
      objectives: [
        {
          type: String,
          trim: true
        }
      ],

      /*
        Important topics covered
        by this lesson.
      */
      keyTopics: [
        {
          type: String,
          trim: true
        }
      ],

      /*
        Main lesson content.
      */
      content: {
        type: [contentBlockSchema],
        default: []
      },

      /*
        Suggested readings.
      */
      readings: {
        type: [readingSchema],
        default: []
      },

      /*
        Additional useful external
        resources/links.
      */
      externalLinks: {
        type: [externalLinkSchema],
        default: []
      },

      /*
        Search query generated by
        Gemini for finding a
        relevant YouTube video.
      */
      videoQuery: {
        type: String,
        trim: true,
        maxlength: 300,
        default: ""
      },

      /*
        YouTube video selected by
        the backend.
      */
      video: {
        type: videoSchema,
        default: null
      },

      /*
        Full lesson translated
        into Roman-script Hinglish.
      */
      hinglishText: {
        type: String,
        default: ""
      },

      /*
        URL/path of generated
        TTS audio.
      */
      audioUrl: {
        type: String,
        default: ""
      },

      /*
        Indicates whether external
        enrichment has been performed.
      */
      isEnriched: {
        type: Boolean,
        default: false
      },

      /*
        Parent module.
      */
      module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true,
        index: true
      }
    },
    {
      timestamps: true
    }
  );


/*
  Useful index for retrieving
  lessons in module order.
*/
lessonSchema.index({
  module: 1,
  order: 1
});


/*
  Create Lesson model.
*/
const Lesson = mongoose.model(
  "Lesson",
  lessonSchema
);

export default Lesson;
