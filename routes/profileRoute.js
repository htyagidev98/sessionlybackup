const express = require('express');
router = express.Router();
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken');
const { adminProfileDetails, updateProfile } = require("../controllers/admin/profileController")

// Admin Api Routes
router.get('/admin/profile/details', xAccessToken, isAdmin, adminProfileDetails);
router.put('/update/profile', xAccessToken, isAdmin, updateProfile);


module.exports = router;