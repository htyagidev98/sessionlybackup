const User = require('../../models/user')
const Validator = require("validatorjs")
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
                status: "success",
                counts: users.length,
                sponseMessage: "Successfully",
                responseData: users,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Data Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//get student list
exports.getStudentsList = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select("first_name last_name email phone role account_info.status createdAt updatedAt").lean();
        if (students && students.length > 0) {
            res.status(200).json({
                status: "success",
                counts: students.length,
                responseMessage: "Successfully",
                responseData: students,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Data Not Found", responseData: {}
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//get teachers list 
exports.getTeachersList = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'expert' })
            .select("first_name last_name email phone role account_info.status createdAt updatedAt").lean();
        if (teachers && teachers.length > 0) {
            res.status(200).json({
                status: "success",
                counts: teachers.length,
                responseMessage: "Successfully",
                responseData: teachers,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Data Not Found", responseData: {}
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            responseMessage: "Internal Server Error", responseData: {}
        });
    }
};

//UpdateAvailabities
exports.updateUser = async (req, res) => {
    try {
        const { _id } = req.query;
        const data = await User.findByIdAndUpdate({ _id: _id }, { $set: { "account_info.status": "active" }, },
            { new: true });
        if (data) {
            res.status(200).json({
                status: "success", responseMessage: " User Updated Successfully", responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "User not found", responseData: {}
            });
        }
        // }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
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
                status: "success", responseMessage: 'Deleted Successfully', responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: 'User Not found', responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", responseMessage: 'Internal Server Error', responseData: {} });
    }
};

