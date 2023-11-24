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
        const users = await User.find(query).sort({ createdAt: -1 }).lean();
        if (users && users.length > 0) {
            let userData = [];
            users.forEach(user => {
                const obj = {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.account_info.status,
                    createdAt: moment(user.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                    updatedAt: moment(user.updatedAt).format("DD-MM-YYYY h:mm:ss A")
                };
                userData.push(obj);
            });
            res.status(200).json({
                status: "success",
                counts: userData.length,
                sponseMessage: "Successfully",
                responseData: userData,
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
        const students = await User.find({ role: 'student' }).lean();
        if (students && students.length > 0) {
            let studentsData = [];
            students.forEach(studentslist => {
                const obj = {
                    _id: studentslist._id,
                    first_name: studentslist.first_name,
                    last_name: studentslist.last_name,
                    email: studentslist.email,
                    phone: studentslist.phone,
                    role: studentslist.role,
                    status: studentslist.account_info.status,
                    createdAt: moment(studentslist.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                    updatedAt: moment(studentslist.updatedAt).format("DD-MM-YYYY h:mm:ss A")
                };
                studentsData.push(obj);
            });
            res.status(200).json({
                status: "success",
                counts: studentsData.length,
                responseMessage: "Successfully",
                responseData: studentsData,
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
        const teachers = await User.find({ role: 'expert' }).lean();
        if (teachers && teachers.length > 0) {
            let teachersData = [];
            teachers.forEach(teacherslist => {
                const obj = {
                    _id: teacherslist._id,
                    first_name: teacherslist.first_name,
                    last_name: teacherslist.last_name,
                    email: teacherslist.email,
                    phone: teacherslist.phone,
                    role: teacherslist.role,
                    status: teacherslist.account_info.status,
                    createdAt: moment(teacherslist.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                    updatedAt: moment(teacherslist.updatedAt).format("DD-MM-YYYY h:mm:ss A")
                };
                teachersData.push(obj);
            });
            res.status(200).json({
                status: "success",
                counts: teachersData.length,
                responseMessage: "Successfully",
                responseData: teachersData,
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


