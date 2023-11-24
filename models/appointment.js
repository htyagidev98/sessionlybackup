const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    appointment_date: {
        type: Date,
        required: true,
    },
    appointment_time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'complete', 'overdue'],
        default: 'accepted'
    },
},
    { timestamps: true, toJSON: true }
);
AppointmentSchema.set("toObject", { virtuals: true });
AppointmentSchema.set('toJSON', { virtuals: true });

const Appointment = mongoose.model("Appointment", AppointmentSchema, "Appointment");
module.exports = Appointment;
