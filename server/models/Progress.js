import mongoose from "mongoose";


const progressSchema =
  new mongoose.Schema(
    {
      /*
        User whose progress is being tracked.
      */
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      /*
        Course being studied.
      */
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true
      },

      /*
        Lesson being tracked.
      */
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
        index: true
      },

      /*
        Whether the lesson has been completed.
      */
      completed: {
        type: Boolean,
        default: false
      },

      /*
        Timestamp when the lesson
        was completed.
      */
      completedAt: {
        type: Date,
        default: null
      },

      /*
        Quiz score.

        Range:
        0 - 100
      */
      quizScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      }
    },
    {
      timestamps: true
    }
  );


/*
  Prevent duplicate progress
  records for the same:

  User + Course + Lesson
*/
progressSchema.index(
  {
    user: 1,
    course: 1,
    lesson: 1
  },
  {
    unique: true
  }
);


/*
  Useful for getting all
  progress records of a course.
*/
progressSchema.index({
  user: 1,
  course: 1
});


/*
  Create Progress model.
*/
const Progress = mongoose.model(
  "Progress",
  progressSchema
);

export default Progress;
