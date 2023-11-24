const { couponAdd, getCoupon, getAllCoupon, updateCoupon, deleteCoupon } = require('../controllers/admin/couponController')
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken')
const express = require('express');
router = express.Router();

//API Router
router.post('/coupon/add', xAccessToken, isAdmin, couponAdd);
router.get('/get/coupon', xAccessToken, isAdmin, getCoupon);
router.get('/get/all/coupon', xAccessToken, isAdmin, getAllCoupon);
router.put('/update/coupon', xAccessToken, isAdmin, updateCoupon);
router.delete('/delete/coupon', xAccessToken, isAdmin, deleteCoupon);

module.exports = router;



