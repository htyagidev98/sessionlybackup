const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CouponSchema = new Schema({
    code: {
        type: String,
        required: true,
    },
    amount_off: {
        type: String,
        required: true,
    },
    start_date: {
        type: String,
        required: true,
    },
    end_date: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
},
    { timestamps: true, toJSON: true }
);
CouponSchema.set("toObject", { virtuals: true });
CouponSchema.set('toJSON', { virtuals: true });

const Coupon = mongoose.model("Coupon", CouponSchema, "Coupon");
module.exports = Coupon;
