const User = require('../../models/user');
const sendEmail = require('../../middlewares/emailSend');
const messages = require("../../utils/messages")
moment = require("moment-timezone")
_ = require("lodash");

//get Users List
exports.getUsersList = async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role === 'student' || role === 'expert') {
            query.role = role;
        } else {
            query.role = { $ne: 'admin' };
        }
        const users = await User.find(query)
            .select("first_name last_name email phone role account_info.status createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();
        if (users && users.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: users.length,
                sponseMessage: messages.SUCCESSFULLY,
                responseData: users,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_USERS_LIST, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//get student list
exports.getStudentsList = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select("first_name last_name email phone role account_info.status createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();
        if (students && students.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: students.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: students,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_STUDENTS, responseData: {}
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//get teachers list 
exports.getTeachersList = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'expert' })
            .select("first_name last_name email phone role account_info.status createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();
        if (teachers && teachers.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: teachers.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: teachers,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_EXPERTS_LIST, responseData: {}
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//Update Account_info.status
exports.updateUser = async (req, res) => {
    try {
        const { _id } = req.query;
        const userData = await User.findByIdAndUpdate({ _id: _id }, { $set: { "account_info.status": "active" }, },
            { new: true });
        if (userData) {
            const transporter = sendEmail();
            const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p style="margin-bottom: 20px;">You are receiving this email because your account is now active.</p>
            <h4 style="color: #4285f4;">You can login with: ${userData.email}</h4>
             </div>
            `;
            await transporter.sendMail({
                from: '"stapletest" <htyagistaple246@gmail.com>',
                to: userData.email,
                subject: 'Account Activity Notification',
                html: emailHtml,
            });
            res.status(200).json({
                status: messages.SUCCESS_STATUS, responseMessage: messages.USER_UPDATE, responseData: {}
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.USER_NOT_FOUND, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//Delete user api
exports.deleteUser = async (req, res) => {
    try {
        const { _id } = req.query;
        const user = await User.findOneAndUpdate({ _id: _id, "account_info.status": "active" },
            { $set: { "account_info.status": "deactivate" }, }, { new: true });
        if (user) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS, responseMessage: messages.USER_DELETE, responseData: {}
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.USER_NOT_FOUND, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};


