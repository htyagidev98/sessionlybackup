const Notification = require("../models/notification")
const io = require('../socket').getIo();
module.exports = {
    webNotification: async (data) => {
        var notificationData = {}
        notificationData = {
            title: 'Register',
            user: data._id,
            user_name: `${data.first_name} ${data.last_name}`,
            user_role: data.role,
            text: "New User Register",
            date: new Date()
        }
        // console.log("notificationData", notificationData)
        // io.emit('leadNotify', `${ bodyData } ${ time } `);
         io.emit('notification', { message: "New User Register", notificationData })
        // console.log("notify", notify)
        await Notification.create(notificationData)

    }

}


// const Notification = require("../models/notification");
// const io = require('../socket').getIo();

// module.exports = {
//     webNotification: async (userData) => {
//         var notificationData = {
//             title: 'Register',
//             user: userData._id,
//             user_name: `${userData.first_name} ${userData.last_name}`,
//             user_role: userData.role,
//             text: "New User Register",
//             date: new Date()
//         };

//         io.emit('notification', { message: "New User Register", notificationData });

//         await Notification.create(notificationData);
//     },

//     loginNotification: async (userData) => {
//         var notificationData = {
//             title: 'Login',
//             user: userData._id,
//             user_name: `${userData.first_name} ${userData.last_name}`,
//             user_role: userData.role,
//             text: "User Logged In",
//             date: new Date()
//         };

//         io.emit('notification', { message: "User Logged In", notificationData });

//         await Notification.create(notificationData);
//     },

//     paymentNotification: async (paymentData, userData) => {
//         var notificationData = {
//             title: 'Payment',
//             user: userData._id,
//             user_name: `${userData.first_name} ${userData.last_name}`,
//             user_role: userData.role,
//             text: `Payment of ${paymentData.amount} received`,
//             date: new Date()
//         };

//         io.emit('notification', { message: `Payment of ${paymentData.amount} received`, notificationData });

//         await Notification.create(notificationData);
//     }
// };

//