const User = require("../../models/user");
const Profile = require("../../models/profile");
const UserAvailabilities = require("../../models/userAvailabities");
const Appointment = require('../../models/appointment');
const Payment = require('../../models/payment')
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const sendEmail = require('../../middlewares/emailSend');
// const videoDuration = require('../../middlewares/videoDuration');
const Validator = require("validatorjs");
const fun = require("../../middlewares/webSocket");
moment = require("moment-timezone")
_ = require("lodash");
const saltRounds = 10;

//// register Expert///
exports.teacherRegister = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const rules = {
            'user.first_name': "required", 'user.last_name': "required", 'user.email': "required",
            'user.phone': "required|min:10|max:14", 'user.password': "required|min:8",
            'user.country_origin': "required", 'profile.language': "required", 'profile.level': "required",
            'profile.subject_taught': "required", 'profile.hourly_rate': "required", 'availability.time_zone': "required",
            'availability.day': "required", 'availability.time_from': "required", 'availability.time_to': "required",
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error",
                responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const videoFileSize = req.files[1].size;
            const videoFileName = req.files[1].filename;
            // const thumbnailFileName = req.files[0].filename;
            const profilePictureFileName = req.files[0].filename;
            const { first_name, last_name, email, password, country_origin, phone } = req.body.user;
            const { language, level, subject_taught, hourly_rate, head_line, about_the_expert } = req.body.profile;
            const { time_zone, day, time_from, time_to } = req.body.availability;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).*$/;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(email)) {
                res.status(400).json({
                    status: "error", responseMessage: "Invalid email address", responseData: {}
                });
            } else if (!passwordRegex.test(password)) {
                res.status(400).json({
                    status: "error",
                    responseMessage: "Password must have one lowercase letter, one uppercase letter, one digit, and one special character.",
                    responseData: {},
                });
            } else {
                const existingUser = await User.findOne({ email: email }).lean();
                if (existingUser) {
                    session.endSession();
                    res.status(400).json({
                        status: "error", responseMessage: 'Email already exists', responseData: {}
                    });
                } else {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);
                    const user = new User({
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        password: hashedPassword,
                        phone: phone,
                        role: "expert",
                        country_origin: country_origin,
                        account_info: { status: "pending" }
                    });
                    await user.save({ session });
                    fun.webNotification(user);

                    const profile = new Profile({
                        language: language,
                        level: level,
                        subject_taught: subject_taught,
                        hourly_rate: hourly_rate,
                        head_line: head_line,
                        about_the_expert: about_the_expert,
                        teacher: user._id,
                        video_url: `${process.env.API_DOMAIN}/videos/${videoFileName}`,
                        image_url: `${process.env.API_DOMAIN}/profile_pictures/${profilePictureFileName}`,
                        // thumbnail_url: `${process.env.API_DOMAIN}thumbnails/${thumbnailFileName}`,
                        video_size: videoFileSize,
                    });
                    await profile.save({ session });
                    const availability = new UserAvailabilities({
                        time_zone: time_zone,
                        day: day,
                        time_from: time_from,
                        time_to: time_to,
                        teacher: user._id
                    });
                    await availability.save({ session });
                    const transporter = sendEmail();
                    const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                <p style="margin-bottom: 20px;">You are receiving this email.
                Your account Status is still pending. Please wait for 5 days for activation.
                </p>
                </div>
            `;
                    await transporter.sendMail({
                        from: '"stapletest" <htyagistaple246@gmail.com>',
                        to: user.email,
                        subject: 'Account Inactivity Notification',
                        html: emailHtml,
                    });
                    await session.commitTransaction();
                    session.endSession();
                    res.status(201).json({
                        status: "success",
                        responseMessage: "Expert Registered Successfully",
                        responseData: user, profile, availability
                    });
                }
            }
        }
    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//get Expert Availabity//
exports.getExpertAvailabity = async (req, res) => {
    try {
        const availability = await UserAvailabilities.findOne({ teacher: req.user._id },
            { time_zone: 1, day: 1, time_from: 1, time_to: 1, createdAt: 1, updatedAt: 1 })
            .populate(
                { path: "teacher", select: "first_name last_name email role phone" }
            ).lean();
        if (availability) {
            res.status(200).json({
                status: "success", responseMessage: "Successfully", responseData: availability,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Availability Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};

//UpdateAvailabities
exports.updateAvailabities = async (req, res) => {
    try {
        const rules = { time_zone: "required", day: "required", time_from: "required", time_to: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { time_zone, day, time_from, time_to } = req.body;
            let AvailabilityData = await UserAvailabilities.findOne({ teacher: req.user._id }).lean();
            if (AvailabilityData) {
                let updateData = {
                    time_zone: time_zone,
                    day: day,
                    time_from: time_from,
                    time_to: time_to,
                    status: "active",
                }
                const data = await UserAvailabilities.findByIdAndUpdate({ _id: AvailabilityData._id }, updateData,
                    { new: true });
                res.status(200).json({
                    status: "success", responseMessage: "Expert Availability Updated Successfully", responseData: data
                });
            } else {
                res.status(404).json({
                    status: "error", responseMessage: "Expert Availability not found", responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//Get TEACHER Profile details
exports.teacherProfileDetails = async (req, res) => {
    try {
        let ProfileData = await Profile.findOne({ teacher: req.user._id }).populate({
            path: "teacher", select: "first_name last_name email phone country_origin role account_info"
        }).lean();
        if (ProfileData) {
            const data = {
                _id: ProfileData._id,
                language: ProfileData.language,
                level: ProfileData.level,
                subject_taught: ProfileData.subject_taught,
                hourly_rate: ProfileData.hourly_rate,
                head_line: ProfileData.head_line,
                about_the_expert: ProfileData.about_the_expert,
                video_url: ProfileData.video_url,
                video_size: ProfileData.video_size,
                video_duration: ProfileData.video_duration,
                thumbnail_url: ProfileData.thumbnail_url,
                image_url: ProfileData.image_url,
                teacher: ProfileData.teacher,
                createdAt: moment(ProfileData.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                updatedAt: moment(ProfileData.updatedAt).format("DD-MM-YYYY h:mm:ss A"),
            }
            res.status(200).json({
                status: "success", responseMessage: "Fetch Successfully", responseData: data,
            });
        } else {
            res.status(422).json({
                status: "error", responseMessage: "No data found ", responseData: {},
            });
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    };
};

//EditExpertsDetails
exports.updateExpertsProfile = async (req, res) => {
    try {
        const rules = {
            first_name: "required", last_name: "required", email: "required",
            phone: "required|digits_between:10,14"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { first_name, last_name, email, phone } = req.body;
            let user = await User.findById(req.user._id).lean();
            if (user) {
                let updateData = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone
                }
                const data = await User.findByIdAndUpdate({ _id: user._id }, updateData, { new: true });
                res.status(200).json({
                    status: "success", responseMessage: " Expert Details Updated Successfully", responseData: data
                });
            } else {
                res.status(404).json({
                    status: "error", responseMessage: "Availability not found", responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//////////Update profile Picture/////////
exports.updateExpertProflePicture = async (req, res) => {
    try {
        let profile = await Profile.findOne({ teacher: req.user._id }).lean();
        if (profile) {
            const { image_url } = req.body; // If there is no file but an image_url is provided in the req body..

            let updateData = {};
            if (req.file) {
                const profilePictureFileName = req.file.filename;
                const imageURL = `${process.env.API_DOMAIN}/profile_pictures/${profilePictureFileName}`;
                updateData.image_url = imageURL;
            } else if (image_url) {
                updateData.image_url = image_url
            }
            const data = await Profile.findByIdAndUpdate({ _id: profile._id }, updateData,
                { new: true });
            res.status(200).json({
                status: "success", responseMessage: " Profile Picture Updated Successfully", responseData: data
            });

        } else {
            res.status(404).json({
                status: "error", responseMessage: "Profile Picture not found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//Get Expert side student list
exports.StudentsList = async (req, res) => {
    try {
        const studentslist = await Payment.find({ teacher_id: req.user._id })
            .select("customer_id amount status createdAt updatedAt")
            .populate([
                {
                    path: "course_id", select: "title description price duration image_url",
                    populate: { path: "category", select: "title description image_url" }
                },
                { path: "teacher_id", select: "first_name last_name email role phone" },
                { path: "coupon_id", select: "code amount_off start_date end_date" },
                { path: "student", select: "first_name last_name email role phone account_info" }
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (studentslist && studentslist.length > 0) {
            res.status(200).json({
                status: "success",
                counts: studentslist.length,
                responseMessage: "Successfully",
                responseData: studentslist,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Student List Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    };
};

///Get Expert payment list////
exports.teacherPaymentList = async (req, res) => {
    try {
        const paymentList = await Payment.find({ teacher_id: req.user._id })
            .select("customer_id name userEmail amount status createdAt updatedAt")
            .populate([
                {
                    path: "course_id", select: "title description price duration image_url",
                    populate: { path: "category", select: "title description image_url" }
                },
                { path: "teacher_id", select: "first_name last_name email role phone" },
                { path: "coupon_id", select: "code amount_off start_date end_date" },
                { path: "student", select: "first_name last_name email role phone" }
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (paymentList && paymentList.length > 0) {
            const totalAmount = paymentList.reduce((
                sum, paymentLists) => sum + paymentLists.amount, 0
            ); //total earning
            res.status(200).json({
                status: "success",
                counts: paymentList.length,
                totalEarning: totalAmount,
                responseMessage: "Successfully",
                responseData: paymentList,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Payment List Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    };
}

/// Get teacher appointment
exports.teacherBookAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.find({ teacher: req.user._id })
            .select("appointment_date appointment_time userEmail status createdAt updatedAt")
            .populate([
                { path: "student", select: "first_name last_name email role phone" },
                { path: "teacher", select: "first_name last_name email role phone" },
                { path: "course_id", select: "title description price duration image_url" }
            ])
            .sort({ createdAt: -1 })
            .lean();
        if (appointment) {
            res.status(200).json({
                status: "success",
                counts: appointment.length,
                responseMessage: "Successfully",
                responseData: appointment,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Appointment Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};



