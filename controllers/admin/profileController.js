const User = require('../../models/user');
const Validator = require("validatorjs");
const messages = require("../../utils/messages")
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
                status: messages.SUCCESS_STATUS, responseMessage: messages.SUCCESSFULLY, responseData: data,
            });
        } else {
            res.status(422).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_PROFILE_DATA, responseData: {},
            });
        };
    } catch (err) {
        console.error(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    };
};

//update admin profile details//
exports.updateProfile = async (req, res) => {
    try {
        const rules = {
            first_name: "required", last_name: "required", email: "required", phone: "required|numeric|digits_between:10,14"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { first_name, last_name, email, phone } = req.body;
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(email)) {
                res.status(400).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.INVALID_EMAIL, responseData: {}
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
                    status: messages.SUCCESS_STATUS,
                    responseMessage: messages.UPDATE_PROFILE_DETAILS, responseData: updateData
                });
            } else {
                res.status(404).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.NO_ADMIN, responseData: {}
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