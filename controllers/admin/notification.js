const Notification = require('../../models/notification');
const messages = require("../../utils/messages");
moment = require("moment-timezone");
_ = require("lodash");

//get All Notification
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
        if (notifications) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: notifications.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: notifications
            });
        } else {
            res.status(400).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.NO_NOTIFICATIONS, responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });

    }
};

//Read mark One notifications
exports.markOneNotificationasread = async (req, res) => {
    try {
        const { _id } = req.query;
        const notificationsData = await Notification.findByIdAndUpdate({ _id: _id, "read": false },
            { $set: { "read": true }, },
            { new: true }).lean();
        if (notificationsData) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                responseMessage: `Notifications for user ${notificationsData.user_name} marked as read`,
                responseData: notificationsData
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_NOTIFICATIONS, responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};

//Read mark all notifications
exports.markAllNotificationasread = async (req, res) => {
    try {
        const notificationsData = await Notification.find({ "read": false },
            { new: true }).lean();
        if (notificationsData && notificationsData.length > 0) {
            updateData = await Notification.updateMany({ "read": false }, { $set: { "read": true } }).lean();
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                responseMessage: messages.ALL_NOTIYFICATIONS_READ,
                responseData: {}
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_NOTIFICATIONS, responseData: {}
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};