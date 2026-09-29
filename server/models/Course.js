import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    /*
      Course title.
    */
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },

    /*
      Course description.
    */
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },

    /*
      Original prompt entered by the user
      to generate this course.
    */
    originalPrompt: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000
    },

    /*
      User who created the course.
    */
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /*
      Course tags.
    */
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 100
      }
    ],

    /*
      Course difficulty.
    */
    difficulty: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced"
      ],
      default: "beginner"
    },

    /*
      Estimated course duration.

      Example:
      "6 hours"
      "2 weeks"
    */
    estimatedDuration: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    /*
      References to Module documents.
    */
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module"
      }
    ]
  },
  {
    timestamps: true
  }
);


/*
  Useful index for fetching
  a user's courses.
*/
courseSchema.index({
  creator: 1,
  createdAt: -1
});


/*
  Create Course model.
*/
const Course = mongoose.model(
  "Course",
  courseSchema
);

export default Course;