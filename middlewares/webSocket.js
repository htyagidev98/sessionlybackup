const Notification = require("../models/notification")
const io = require('../socket').getIo();
module.exports = {

    //Register Notification admin
    webNotification: async (data) => {
        if (data.role !== 'expert') {
            var notificationData = {}
            notificationData = {
                title: 'Register',
                user: data._id,
                user_name: `${data.first_name} ${data.last_name}`,
                user_role: data.role,
                text: "New User Register",
                date: new Date()
            }
            io.emit('notification', { message: "New User Register", notificationData })
            await Notification.create(notificationData)
        } else {
            var notificationData = {}
            notificationData = {
                title: 'Register',
                user: data._id,
                user_name: `${data.first_name} ${data.last_name}`,
                user_role: data.role,
                text: "New Expert Register",
                date: new Date(),
                status: data.account_info.status

            }
            io.emit('notification', { message: "New Expert Register", notificationData })
            await Notification.create(notificationData)
        }
    },

    //Login Notification admin
    loginNotification: async (user) => {
        if (user.role !== 'admin') {
            var notificationData = {
                title: 'Login',
                user: user._id,
                user_name: `${user.first_name} ${user.last_name}`,
                user_role: user.role,
                // device_id: user.device[0].uuid,
                text: "User Logged In",
                date: new Date()
            };
            io.emit('notification', { message: "User Logged In", notificationData });
            await Notification.create(notificationData);
        }
    },

    //payment Notification admin
    paymentNotification: async (paymentData) => {
        var paymentNotification = {
            title: 'Payment',
            user: paymentData.student,
            teacher: paymentData.teacher_id,
            user_name: paymentData.name,
            amount: paymentData.amount,
            user_email: paymentData.userEmail,
            text: `Payment of ${paymentData.amount} received`,
            date: new Date(),
            status: paymentData.status
        };
        io.emit('notification', { message: `Payment of ${paymentData.amount} received`, paymentNotification });
        await Notification.create(paymentNotification);
    }
};
