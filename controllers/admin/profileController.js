const User = require('../../models/user')
const Validator = require("validatorjs")
moment = require("moment-timezone")
_ = require("lodash");

///Get admin Profile details///
exports.adminProfileDetails = async (req, res) => {
    try {
        let adminData = await User.findById(req.user._id).lean();
        if (adminData) {
            const data = {
                _id: adminData._id,
                first_name: adminData.first_name,
                last_name: adminData.last_name,
                email: adminData.email,
                phone: adminData.phone,
                role: adminData.role,
                status: adminData.account_info.status,
                createdAt: moment(adminData.createdAt).format("DD-MM-YYYY h:mm:ss A"),
                updatedAt: moment(adminData.updatedAt).format("DD-MM-YYYY h:mm:ss A")
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

//update admin profile details//
exports.updateProfile = async (req, res) => {
    try {
        const rules = { first_name: "required", last_name: "required", email: "required", phone: "required|digits_between:10,14" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { first_name, last_name, email, phone } = req.body;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(email)) {
                res.status(400).json({
                    status: "error", responseMessage: "Invalid email address", responseData: {}
                });
            }
            let adminData = await User.findById(req.user._id).lean();
            if (adminData) {
                let updateData = {
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone
                }
                await User.findByIdAndUpdate({ _id: adminData._id }, updateData, { new: true });
                res.status(200).json({
                    status: "success", responseMessage: " Expert Details Updated Successfully", responseData: updateData
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