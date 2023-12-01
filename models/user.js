const mongoose = require("mongoose");
const Schema = mongoose.Schema

var DeviceInfoSchema = new Schema({
    uuid: {
        type: String,
    },
    token:
    {
        type: String,
    },
});
const AuthSchema = new Schema({
    resetToken: {
        type: String,
        default: null,
    },
    expires: {
        type: Date,
        default: new Date(),
        // expires: new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours in milliseconds
    }
});

const AccountInfoSchema = new Schema({
    status: {
        type: String,
        enum: ["active", "deactivate", "pending"],
        default: "active",
    },
});

const UserSchema = new Schema({

    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    country_origin: {
        type: String,
        // required: true,
    },
    role: {
        type: String,
        default: "student",
    },
    account_info: AccountInfoSchema,
    auth: AuthSchema,
    device: [DeviceInfoSchema],
},
    { timestamps: true, toJSON: true }
);

UserSchema.set("toObject", { Virtual: true });
UserSchema.set("toJSON", { Virtual: true });

const User = mongoose.model("User", UserSchema, "User");
module.exports = User;



