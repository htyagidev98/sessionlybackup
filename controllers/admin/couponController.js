const Coupon = require("../../models/coupon");
const messages = require("../../utils/messages")
const Validator = require("validatorjs"),
    _ = require("lodash");

//Add coupon
exports.couponAdd = async (req, res) => {
    try {
        const rules = {
            code: "required", amount_off: "required", start_date: "required", end_date: "required"
        };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: messages.ERROR_STATUS,
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { code, amount_off, start_date, end_date } = req.body;
            const coupon = await Coupon.findOne({ code: code }).lean();
            if (!coupon) {
                const couponData = await Coupon.create({
                    code: code,
                    amount_off: amount_off,
                    start_date: start_date,
                    end_date: end_date,
                })
                res.status(201).json({
                    status: messages.SUCCESS_STATUS, responseMessage: messages.ADD_COUPON, responseData: couponData
                });
            } else {
                res.status(403).json({
                    status: messages.ERROR_STATUS, responseMessage: messages.EXIST_COUPON, responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//get all coupon api
exports.getAllCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .select("code amount_off start_date end_date status createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();
        if (coupons && coupons.length > 0) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS,
                counts: coupons.length,
                responseMessage: messages.SUCCESSFULLY,
                responseData: coupons,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_COUPON, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
};

//get coupon
exports.getCoupon = async (req, res) => {
    try {
        const { _id } = req.query;
        const couponData = await Coupon.findOne({ _id: _id }).lean();
        if (couponData) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS, responseMessage: messages.SUCCESSFULLY, responseData: couponData,
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_COUPON, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};

//update coupon
exports.updateCoupon = async (req, res,) => {
    try {
        const rules = { code: "required", amount_off: "required", start_date: "required", end_date: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                responseMessage: messages.VALIDATION_ERROR, responseData: validation.errors.all(),
            });
        } else {
            const { code, amount_off, start_date, end_date } = req.body;
            const { _id } = req.query;
            let couponData = await Coupon.findById(_id).lean();
            if (couponData) {
                let updatedData = {
                    code: code,
                    amount_off: amount_off,
                    start_date: start_date,
                    end_date: end_date,
                    status: "active"
                }
                const data = await Coupon.findByIdAndUpdate({ _id: couponData._id }, updatedData, { new: true });
                res.status(200).json({
                    responseMessage: messages.UPDATE_COUPON, responseData: data
                });
            } else {
                res.status(404).json({
                    responseMessage: messages.NO_COUPON, responseData: {},
                });
            };
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {},
        });
    }
};

//Coupon Delete
exports.deleteCoupon = async (req, res) => {
    try {
        const { _id } = req.query;
        const couponData = await Coupon.findOneAndUpdate({ _id: _id, status: "active" },
            { $set: { status: "inactive" }, }, { new: true });
        if (couponData) {
            res.status(200).json({
                status: messages.SUCCESS_STATUS, esponseMessage:messages.DELETE_COUPON, responseData: {}
            });
        } else {
            res.status(404).json({
                status: messages.ERROR_STATUS, responseMessage: messages.NO_COUPON, responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: messages.ERROR_STATUS, responseMessage: messages.SERVER_ERROR, responseData: {}
        });
    }
}




