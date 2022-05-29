var express = require('express');
var router = express.Router();
const uploadController = require('../controllers/upload')
const { isAuth,generateSendJWT } = require('../service/auth');
const upload = require('../service/image');

/* GET users listing. */
router.post('/upload',isAuth, upload, uploadController.upload);

module.exports = router;
