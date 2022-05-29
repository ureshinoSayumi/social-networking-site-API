const multer = require('multer');
const path = require('path');
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const upload = multer({
  limits: {
    fileSize: 2*1024*1024, // 設定尺寸限制 2MB
  },
	// middleware 如果 Error 就會 next() 至錯誤處理
	// multer 會將圖片放到 req.files 傳到下一個 middleware
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
    }
    cb(null, true);
  },
}).any();

module.exports = upload 