const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken');
const {
    categoryAdd,
    getAllCategory,
    getCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/admin/categoryController');

// Image Upload 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "category_pic") {
            cb(null, "./uploads/category_pictures");
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

// API Routes with Multer file upload middleware
router.post('/category/add', xAccessToken, isAdmin, upload.single('category_pic'), categoryAdd);
router.get('/get/all/category', xAccessToken, isAdmin, getAllCategory);
router.get('/get/category', xAccessToken, isAdmin, getCategory);
router.put('/update/category', xAccessToken, isAdmin, upload.single('category_pic'), updateCategory);
router.delete('/delete/category', xAccessToken, isAdmin, deleteCategory);

module.exports = router;
