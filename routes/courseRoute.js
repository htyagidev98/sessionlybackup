const express = require('express');
const multer = require('multer');
const path = require('path');
router = express.Router();
const { xAccessToken, isTeacher } = require('../middlewares/xAccessToken');
const {
    courseAdd,
    getAllCourse,
    getCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/teacher/courseController");

// Image Upload 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "course_pic") {
            cb(null, "./uploads/course_pictures");
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    },
});

const fileFilter = (req, file, cb) => {
    const acceptedExtensionsList = [".jpg", ".jpeg", ".png"];
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

//Api Routes
router.post('/course/add', xAccessToken, isTeacher, upload.single('course_pic'), courseAdd);
router.get('/get/all/course', xAccessToken, isTeacher, getAllCourse);
router.get('/get/course', xAccessToken, isTeacher, getCourse);
router.put('/update/course', xAccessToken, isTeacher, upload.single('course_pic'), updateCourse);
router.delete('/delete/course', xAccessToken, isTeacher, deleteCourse);


module.exports = router;