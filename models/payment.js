const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    customer_id: {
        type: String,
        required: true,
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    amount: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
},
    { timestamps: true, toJSON: true }
);
PaymentSchema.set("toObject", { virtuals: true });
PaymentSchema.set('toJSON', { virtuals: true });

const Payment = mongoose.model("Payment", PaymentSchema, "Payment");
module.exports = Payment;
