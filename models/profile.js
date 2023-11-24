const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  language: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  subject_taught: {
    type: String,
    required: true,
  },
  hourly_rate: {
    type: String,
    required: true,
  },
  head_line: {
    type: String,
    required: true,
  },
  about_the_expert: {
    type: String,
    required: true,
  },
  video_url: {
    type: String,
  },
  video_size: {
    type: String,
  },
  video_duration: {
    type: String,
  },
  thumbnail_url: {
    type: String,
  },
  image_url: {
    type: String,
  },
},
  { timestamps: true, toJSON: true }
);

ProfileSchema.set("toObject", { virtuals: true });
ProfileSchema.set('toJSON', { virtuals: true });

const Profile = mongoose.model("Profile", ProfileSchema, "Profile");
module.exports = Profile;
