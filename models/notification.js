const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const NotificationSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            require: true
        },
        user_name: {
            type: String,
            require: true
        },
        user_role: {
            type: String,
            require: true
        },
        title: {
            type: String,
            require: true
        },
        text: {
            type: String,
            require: true
        },
        read: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            require: true
        }
    }, { timestamps: true, toJSON: true }
);
NotificationSchema.set("toObject", { virtuals: true });
NotificationSchema.set('toJSON', { virtuals: true });

const Notification = mongoose.model("Notification", NotificationSchema, "Notification");
module.exports = Notification;