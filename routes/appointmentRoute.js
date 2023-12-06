const {
    bookAppointment,
    getBookAppointment,
    studentBookAppointment,
    getAppointmentTime
} = require('../controllers/appointmentController');
const { xAccessToken } = require('../middlewares/xAccessToken');
const express = require('express');
router = express.Router();

// API Router
router.post('/book/appointment', xAccessToken, bookAppointment);
router.get('/get/book/appointment', xAccessToken, getBookAppointment);
router.get('/student/book/appointment', xAccessToken, studentBookAppointment);
router.get('/get/appointment/time', xAccessToken, getAppointmentTime);

module.exports = router;

