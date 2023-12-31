const Payment = require("../models/payment");
const Validator = require("validatorjs");
const config = require("../config");
const stripe = require('stripe')(config.STRIPE_SECRET);
const fun = require("../middlewares/webSocket");
const messages = require("../utils/messages");
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
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { token, amount, course_id, coupon_id, teacher_id } = req.body;
            const customer = await stripe.customers.create({
                source: token,
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                },
                description: 'Purchase',
                // description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
            });
            const paymentIntent = await stripe.paymentIntents.create({
                customer: customer.id,
                payment_method_types: ["card"],
                // payment_method: 'pm_card_visa', //customer.default_source on live
                payment_method: 'pm_card_threeDSecureRequired', //customer.default_source on live
                amount: amount * 100,
                currency: 'USD', //USD
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
                fun.paymentNotification(data)
            }
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                responseMessage: messages.PAYMENT_SUCCESS, responseData: paymentIntentconfirm
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }

};

///stripe payment confirm/////
exports.paymentConfirm = async (req, res) => {
    try {
        const { payment_intent_id } = req.body;
        if (typeof payment_intent_id !== 'string' || !payment_intent_id) {
            res.status(400).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.INVALID_PAYMENT_ID, responseData: {}
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
        fun.paymentNotification(data)
        res.status(201).json({
            status: messages.SUCCESS_STATUS,
            responseMessage: messages.PAYMENT_SUCCESS, responseData: { confirmintent, data }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
}

//// Admin side All Payment list///
exports.getPaymentList = async (req, res) => {
    try {
        const paymentList = await Payment.find()
            .select("customer_id name userEmail amount status createdAt updatedAt")
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
                status: messages.SUCCESS_STATUS,
                counts: paymentList.length,
                totalAmount: totalAmount,
                responseMessage: messages.SUCCESSFULLY,
                responseData: paymentList,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_TRANSACTIONS_LIST, responseData: {}
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};



