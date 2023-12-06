const Coupon = require("../../models/coupon");
const Validator = require("validatorjs"),
_ = require("lodash");

//Add coupon
exports.couponAdd = async (req, res) => {
    try {
        const rules = { code: "required", amount_off: "required", start_date: "required", end_date: "required" };
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            res.status(422).json({
                status: "error", responseMessage: "Validation Error", responseData: validation.errors.all(),
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
                    status: "success", responseMessage: "Coupon created Successfully", responseData: couponData
                });
            } else {
                res.status(403).json({
                    status: "error", responseMessage: "Coupon Already Exist", responseData: {}
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
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
                status: "success",
                counts: coupons.length,
                responseMessage: "Successfully",
                responseData: coupons,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "coupons Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {}
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
                status: "success", responseMessage: "Successfully", responseData: couponData,
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: "Coupon Not Found", responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
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
                responseMessage: "Validation Error", responseData: validation.errors.all(),
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
                    responseMessage: "Coupon Updated Successfully", responseData: data
                });
            } else {
                res.status(404).json({
                    responseMessage: "Data not found", responseData: {},
                });
            };
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: "Internal Server Error", responseData: {},
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
                status: "success", esponseMessage: 'Deleted Successfully', responseData: {}
            });
        } else {
            res.status(404).json({
                status: "error", responseMessage: 'Coupon Not Found', responseData: {}
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error", responseMessage: 'Internal Server Error', responseData: {}
        });
    }
}




