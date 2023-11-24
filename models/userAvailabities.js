const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserAvailabilitiesSchema = new Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  time_zone: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  time_from: {
    type: String,
    required: true,
  },
  time_to: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
}, { timestamps: true, toJSON: true });

UserAvailabilitiesSchema.set("toObject", { virtuals: true });
UserAvailabilitiesSchema.set('toJSON', { virtuals: true });

const UserAvailabilities = mongoose.model("UserAvailabilities", UserAvailabilitiesSchema, "UserAvailabilities");
module.exports = UserAvailabilities;
