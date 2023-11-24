const express = require('express');
router = express.Router();
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken');
const { userPayment, paymentConfirm, getPaymentList } = require("../controllers/paymentController")

//Api Routes
router.post('/user/payment', xAccessToken, userPayment);
router.post('/payment/confirm', xAccessToken, paymentConfirm);

//admin side paymnet list api
router.get('/get/payment/list', xAccessToken, isAdmin, getPaymentList);
module.exports = router;
