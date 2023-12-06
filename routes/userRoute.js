const {
    getUsersList,
    getStudentsList,
    getTeachersList,
    updateUser,
    deleteUser
} = require('../controllers/admin/userController');
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken');
const express = require('express');
router = express.Router();

//  API Router
router.get('/get/users/list', xAccessToken, isAdmin, getUsersList);
router.get('/get/students/list', xAccessToken, isAdmin, getStudentsList);
router.get('/get/teachers/list', xAccessToken, isAdmin, getTeachersList);
router.put('/update/user', xAccessToken, isAdmin, updateUser);
router.delete('/delete/user', xAccessToken, isAdmin, deleteUser);

module.exports = router;



