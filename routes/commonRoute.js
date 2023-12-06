const {
    allCategories,
    getCategorylist,
    searchExperts,
    teacherProfileDetails,
    updateStudentProfile,
    studentProfileDetails,
    teacherAvailabities,
    getAllCourse,
    studentTransactionList
} = require("../controllers/common/commonController");
const express = require('express');
const { xAccessToken } = require("../middlewares/xAccessToken");
router = express.Router();

//Api Routes;
router.get('/all/categories', allCategories);
router.get('/get/categoryList', getCategorylist);
router.get('/search/experts', searchExperts);
router.get('/get/all/course', getAllCourse);
//teacher api
router.get('/teacher/profile/details', teacherProfileDetails);
router.get('/teacher/availabities', teacherAvailabities);

//student api
router.get('/student/transaction/list', xAccessToken, studentTransactionList);
router.get('/student/profile/details', xAccessToken, studentProfileDetails);
router.put('/update/student/profile', xAccessToken, updateStudentProfile);


module.exports = router;