const Appointment = require('../models/appointment');
const Validator = require("validatorjs");
const messages = require("../utils/messages");
moment = require("moment-timezone")
_ = require("lodash");

//bookAPoointment
exports.bookAppointment = async (req, res) => {
    try {
        const rules = {
            student: "required", teacher: "required", course_id: "required",
            appointment_date: "required", appointment_time: "required"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { student, teacher, course_id, appointment_date, appointment_time } = req.body;
            const appointmentExist = await Appointment.findOne({
                appointment_date: appointment_date, appointment_time: appointment_time
            }).lean();
            if (!appointmentExist) {
                let appointmentData = await Appointment.create({
                    student: student,
                    teacher: teacher,
                    course_id: course_id,
                    appointment_date: appointment_date,
                    appointment_time: appointment_time
                });
                res.status(201).json({
                    status: messages.SUCCESS_STATUS,
                    responseMessage: messages.Book_APPOINTMENT, responseData: appointmentData
                });
            } else {
                res.status(403).json({
                    status: messages.ERROR_STATUS,
                    responseMessage: messages.EXIST_APPOINTMENT, responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//get singal Appointement
exports.getBookAppointment = async (req, res) => {
    try {
        const { _id } = req.query;
        const appointment = await Appointment.findOne({ _id: _id }).populate([
            { path: "student", select: "first_name last_name email role phone" },
            { path: "teacher", select: "first_name last_name email role phone" },
            { path: "course_id", select: "appointment description price duration image_url" }
        ]).lean();
        if (appointment) {
            let appointmentData = {
                _id: appointment._id,
                appointment_date: moment(appointment.appointment_date).format("YYYY-MM-DD h:mm:ss A"),
                appointment_time: appointment.appointment_time,
                status: appointment.status,
                teacher: appointment.teacher,
                student: appointment.student,
                course_id: appointment.course_id,
                createdAt: moment(appointment.createdAt).format("YYYY-MM-DD h:mm:ss A"),
                updatedAt: moment(appointment.updatedAt).format("YYYY-MM-DD h:mm:ss A")
            };
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                responseMessage: messages.SUCCESSFULLY, responseData: appointmentData,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NOT_APPOINTMENT, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};

/// get student appointment
exports.studentBookAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.find({ student: req.user._id })
            .select("appointment_date appointment_time status createdAt updatedAt")
            .populate([
                { path: "student", select: "first_name last_name email role phone" },
                { path: "teacher", select: "first_name last_name email role phone" },
                { path: "course_id", select: "title description price duration image_url" }
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (appointment && appointment.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: appointment.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: appointment,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_APPOINTMENTS_LIST, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};

//get  Appointement time on that  date
exports.getAppointmentTime = async (req, res) => {
    try {

        const { appointment_date } = req.query;
        const appointmentTime = await Appointment.find({ appointment_date: appointment_date },
            { _id: 1, appointment_date: 1, appointment_time: 1, status: 1, createdAt: 1, updatedAt: 1 })
            .sort({ createdAt: -1 })
            .lean();
        if (appointmentTime && appointmentTime.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: appointmentTime.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: appointmentTime,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_APPOINTMENTS_LIST, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};