const Payment = require("../models/payment");
const Validator = require("validatorjs");
const config = require("../config")
const stripe = require('stripe')(config.STRIPE_SECRET);
moment = require("moment-timezone");
_ = require("lodash");

//// student Payment////
exports.userPayment = async (req, res) => {
    try {
        const rules = {
            token: "required", amount: "required", course_id: "required", coupon_id: "required", teacher_id: "required"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
            });
        } else {
            const { token, amount, course_id, coupon_id, teacher_id } = req.body;
            const customer = await stripe.customers.create({
                source: token,
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                description: 'Example Charge',
                // business_vat_id: 'acct_1NsgDPSGZG5DL3Xo', // Provide your business registration number
                // description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
            });
            const paymentIntent = await stripe.paymentIntents.create({
                customer: customer.id,
                payment_method_types: ["card"],
                // payment_method: 'pm_card_visa', //customer.default_source on live
                payment_method: 'pm_card_threeDSecureRequired', //customer.default_source on live
                amount: amount * 100,
                currency: 'INR',  //USD
                description: 'Example Charge',
                metadata: {
                    integration_check: 'accept_a_payment',
                    name: `${req.user.first_name} ${req.user.last_name}`,
                    userEmail: req.user.email,
                    course_id: course_id,
                    coupon_id: coupon_id,
                    teacher_id: teacher_id
                },
            });
            const paymentIntentconfirm = await stripe.paymentIntents.confirm(
                paymentIntent.id,
                // { setup_future_usage: 'on_session', }
                // { setup_future_usage: 'off_session', } // This is for subscription plan
            );
            if (paymentIntentconfirm.status == "succeeded") {
                await Payment.create({
                    customer_id: customer.id,
                    amount: amount,
                    name: `${req.user.first_name} ${req.user.last_name}`,
                    userEmail: req.user.email,
                    student: req.user._id,
                    course_id: course_id,
                    coupon_id: coupon_id,
                    teacher_id: teacher_id,
                    status: paymentIntentconfirm.status
                });
            }
            res.status(200).json({
                status: "success", responseMessage: "Successfully", responseData: paymentIntentconfirm
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }

};

///stripe payment confirm/////
exports.paymentConfirm = async (req, res) => {
    try {
        const { payment_intent_id } = req.body;
        if (typeof payment_intent_id !== 'string' || !payment_intent_id) {
            res.status(400).json({
                status: "error", responseMessage: "Invalid or missing payment intent ID", responseData: {}
            });
        }
        const confirmintent = await stripe.paymentIntents.retrieve(payment_intent_id);
        let data = await Payment.create({
            customer_id: confirmintent.customer,
            amount: confirmintent.amount / 100,           //Save in Doller
            student: req.user._id,
            name: `${req.user.first_name} ${req.user.last_name}`,
            userEmail: req.user.email,
            course_id: confirmintent.metadata.course_id,
            coupon_id: confirmintent.metadata.coupon_id,
            teacher_id: confirmintent.metadata.teacher_id,
            status: confirmintent.status
        });
        res.status(201).json({
            status: "success", responseMessage: "Payment Successfully", responseData: { confirmintent, data }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
}

//// Admin side All Payment list///
exports.getPaymentList = async (req, res) => {
    try {
        const paymentList = await Payment.find()
            .select("customer_id name userEmail amount status")
            .populate([
                {
                    path: "course_id", select: "title description price duration image_url teacher",
                    populate: { path: "category", select: "title description image_url" }
                },
                { path: "teacher_id", select: "first_name last_name email role phone" },
                { path: "coupon_id", select: "code amount_off start_date end_date" },
                { path: "student", select: "first_name last_name email role phone" }
            ]).sort({ createdAt: -1 }).lean();
        if (paymentList && paymentList.length > 0) {
            const totalAmount = paymentList.reduce((
                sum, paymentLists) => sum + paymentLists.amount, 0 
                );
            res.status(200).json({
                status: "success",
                counts: paymentList.length,
                totalAmount: totalAmount,
                responseMessage: "Successfully",
                responseData: paymentList,
            });
        } else {
            res.status(404).json({ status: "error", responseMessage: "paymentList Not Found", responseData: {} })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
        });
    }
};



