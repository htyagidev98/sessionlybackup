const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { xAccessToken, isTeacher } = require('../middlewares/xAccessToken');
const { teacherRegister, updateExpertsProfile, updateAvailabities, StudentsList, teacherPaymentList, teacherBookAppointment, teacherProfileDetails } = require('../controllers/teacher/teacherController');

// Image,file Upload 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "thumbnail") {
            cb(null, "./uploads/thumbnails");
        } else if (file.fieldname === "video") {
            cb(null, "./uploads/videos");
        } else if (file.fieldname === "profile_pic") {
            cb(null, "./uploads/profile_pictures");
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    },
});

const fileFilter = (req, file, cb) => {
    const acceptedExtensionsList = [".jpg", ".jpeg", ".png", ".mp4"];
    const extname = path.extname(file.originalname).toLowerCase();
    if (acceptedExtensionsList.includes(extname)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// API Routes
router.post('/teacher/register', upload.any("profile_pic", "video"), teacherRegister);
router.put('/update/expert/profile', xAccessToken, isTeacher, updateExpertsProfile);
router.put('/update/availabities', xAccessToken, isTeacher, updateAvailabities);
router.get('/students/list', xAccessToken, isTeacher, StudentsList);
router.get('/teacher/payment/list', xAccessToken, isTeacher, teacherPaymentList);
router.get('/teacher/book/appointment', xAccessToken, isTeacher, teacherBookAppointment);
router.get('/teacher/profile/details', xAccessToken, isTeacher, teacherProfileDetails);

module.exports = router;
