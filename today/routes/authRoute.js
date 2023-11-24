const { signUp, logIn, forgotPassword, changePassword, resetPassword } = require('../controllers/authController')
const { xAccessToken } = require('../middlewares/xAccessToken')
const express = require('express');
router = express.Router();

// API Router
router.post('/signup', signUp);
router.post('/login', logIn);
router.put('/forgot/password', forgotPassword);
router.post('/reset/password', resetPassword);
router.post('/change/password', xAccessToken, changePassword);

module.exports = router;



