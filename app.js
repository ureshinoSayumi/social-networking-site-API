var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const postsRouter = require('./routes/posts');
const appError = require('./service/appError')

process.on('uncaughtException', err => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
	console.error('Uncaughted Exception！')
	console.error(err)
	console.error(err.message)
	console.error(err.stack)
	process.exit(1)
});
// 未捕捉到的 catch 
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
});

var app = express();

const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config({ path: './config.env'})

const DB = process.env.DATABASE.replace(
	'<password>',
	process.env.DATABASE_PASSWORD
)

// 連接資料庫
mongoose.connect(DB)
	.then(()=>{
		console.log('是否開發者模式' ,process.env.NODE_ENV)
		console.log('資料庫連線成功')
	})
	.catch((error)=>{
		console.log(error);
	});

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(usersRouter);
app.use(postsRouter);
app.use(uploadRouter)
// app.use('/posts', postsRouter);
// 404
app.use(function(req, res, next) {
	appError(404, '404 無此路由', next)
})
// express 錯誤處理
// 正式環境錯誤 err 錯誤 
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
	res.status(500).json({
		message: err.message,
		error: err,
		stack: err.stack
	})
}
// 傳遞變數是由判斷是err物件還是req物件
app.use(function(err, req, res, next) {
	err.statusCode = err.statusCode || 500
	if (process.env.NODE_ENV === 'dev') {
		return resErrorDev(err, res)
	}
	
	// moongose 錯誤
	if (err.name === 'ValidationError'){
    err.message = "資料欄位未填寫正確，請重新輸入！"
    err.isOperational = true;
    return resErrorProd(err, res)
  }
	resErrorProd(err, res)
})

module.exports = app;
console.log('http://127.0.0.1:3005/');