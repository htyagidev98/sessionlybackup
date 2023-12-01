const { getAllNotifications, markOneNotificationasread, markAllNotificationasread } = require('../controllers/admin/notification')
const { xAccessToken, isAdmin } = require('../middlewares/xAccessToken')
const express = require('express');
router = express.Router();

// API Router
router.get('/get/all/notifications', xAccessToken, isAdmin, getAllNotifications);
router.put('/mark/one/notifications/read', xAccessToken, isAdmin, markOneNotificationasread);
router.put('/mark/all/notifications/read', xAccessToken, isAdmin, markAllNotificationasread);


module.exports = router;



