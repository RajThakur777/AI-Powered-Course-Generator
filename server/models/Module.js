import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    /*
      Module title.
    */
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },

    /*
      Module description.
    */
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },

    /*
      Module position inside the course.

      Example:
      1 = first module
      2 = second module
    */
    order: {
      type: Number,
      required: true,
      min: 0
    },

    /*
      Parent course.
    */
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    /*
      References to Lesson documents.
    */
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ]
  },
  {
    timestamps: true
  }
);


/*
  Useful index for retrieving
  modules in course order.
*/
moduleSchema.index({
  course: 1,
  order: 1
});


/*
  Create Module model.
*/
const Module = mongoose.model(
  "Module",
  moduleSchema
);

export default Module;
