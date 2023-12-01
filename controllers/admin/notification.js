const User = require('../../models/user')
const Notification = require('../../models/notification')
const Validator = require("validatorjs")
moment = require("moment-timezone")
_ = require("lodash");

//get All Notification
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
        if (notifications) {
            res.status(200).json({
                status: "success",
                counts: notifications.length,
                responseMessage: "Successfully",
                responseData: notifications,
            });
        } else {
            res.status(400).json({
                status: "error",
                responseMessage: ' notifications Not found', responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });

    }
};

exports.markOneNotificationasread = async (req, res) => {
    try {
        const { _id } = req.query;
        const notificationsData = await Notification.findByIdAndUpdate({ _id: _id, "read": false },
            { $set: { "read": true }, },
            { new: true }).lean();
        if (notificationsData) {
            res.status(200).json({
                status: "success",
                responseMessage: `Notifications for user ${notificationsData.user_name}marked as read`,
                responseData: { notificationsData }
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Notifications not found", responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};

exports.markAllNotificationasread = async (req, res) => {
    try {
        const notificationsData = await Notification.find({ "read": false },
            { new: true }).lean();
        if (notificationsData.length > 0) {
            await Notification.updateMany({ "read": false }, { $set: { "read": true } });
            res.status(200).json({
                status: "success",
                responseMessage: `All Notifications for user marked as read`,
                responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Notifications not found", responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
        });
    }
};