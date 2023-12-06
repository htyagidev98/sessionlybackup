const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const NotificationSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        user_name: {
            type: String,
        },
        user_email: {
            type: String,
        },
        user_role: {
            type: String,
        },
        title: {
            type: String,
        },
        text: {
            type: String,
        },
        amount: {
            type: Number,
        },
        read: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
        },
        status: {
            type: String,
        }
        // device_id: {
        //     type: String,
        //     require: false,
        //     default: null
        // }
    }, { timestamps: true, toJSON: true }
);
NotificationSchema.set("toObject", { virtuals: true });
NotificationSchema.set('toJSON', { virtuals: true });

const Notification = mongoose.model("Notification", NotificationSchema, "Notification");
module.exports = Notification;