const sucessHandle = require('../service/sucessHandle')
const appError = require('../service/appError')
const handleErrorAsync = require('../service/handleErrorAsync')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { isAuth,generateSendJWT } = require('../service/auth')

const userController = {
	getAllUser: async function(req, res, next) {
		const newUser = await User.find()
	  sucessHandle(res, newUser, '取得成功')
	},
	getPost: handleErrorAsync(async (req, res, next) => {
		const user = req.params.id
		console.log({user})
		const newUser = await User.findById(user)
		if (newUser === null) {
			return appError(400, '無此使用者', next)
		}

		const newPost = await Post.find({user}).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		});
		sucessHandle(res, newPost, '取得成功') 
  	}),
	// createUser: handleErrorAsync(async function(req, res, next) {
	// 	const createUser = req.body;
	// 	console.log(req.body, 'asd')
	// 	if (!createUser.name || !createUser.email) {
	// 		return appError(400, '單筆建立失敗，名稱必填', next)
	// 	}
	// 	const newUser = await User.create(req.body)
	// 	sucessHandle(res, newUser, '建立成功')
	// }),

	sing_up: handleErrorAsync(async function(req, res, next) {
		let { email, password, confirmPassword, name } = req.body;
		const errArt = []
		// 內容不可為空
		if(!email || !password || !confirmPassword || !name){
			errArt.push('內容不可為空')
		}
		// 密碼正確
		if(password!==confirmPassword){
			errArt.push('密碼不一致！')
		}
		// 密碼 8 碼以上
		if(!validator.isLength(password,{min:8})){
			errArt.push('密碼字數低於 8 碼')
		}
		// 是否為 Email
		if(!validator.isEmail(email)){
			errArt.push('Email 格式不正確')
		}
		if (errArt.length !== 0) {
			return next(appError("400", errArt, next));
		}
		// 加密密碼
		password = await bcrypt.hash(req.body.password,12);
		const newUser = await User.create({
			email,
			password,
			name
		});
		console.log(newUser, 'newUser')
		generateSendJWT(newUser, 201, res);
		// sucessHandle(res, 'newUser', '建立成功')
	}),

	sing_in: handleErrorAsync(async function(req, res, next) {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(appError( 400,'帳號密碼不可為空',next));
		}
		const user = await User.findOne({ email }).select('+password');
		console.log(user, 'user')
		const auth = await bcrypt.compare(password, user.password);
		if(!auth){
			return next(appError(400,'您的密碼不正確',next));
		}
		generateSendJWT(user, 200, res);
	}),

	profile: handleErrorAsync(async function(req, res, next) {
		const newUser = await User.findById(req.user.id).select('+email')
		console.log(newUser)
		sucessHandle(res, { user: newUser }, '登入驗證成功')
	}),

	updateProfile: handleErrorAsync(async function(req, res, next) {
		console.log(req.body, 'req.body')
		const { name, sex, image } = req.body
		if(!name || !sex) {
			return next(appError("400","名字、性別不可為空",next))
		}
		console.log(name, sex, 'name, sex')
		const newUser = await User.findByIdAndUpdate(req.user.id, {
			name: name,
			sex: sex,
			image: image
		}, { returnDocument: 'after' })
		console.log(newUser, 'useruser')

		sucessHandle(res, { user: newUser }, '個人資料更改成功')
	}),

	updatePassword: handleErrorAsync(async function(req, res, next) {
		const { password, confirmPassword } = req.body
		if(password !== confirmPassword) {
			return next(appError("400","密碼不一致！",next))
		}
		newPassword = await bcrypt.hash(password,12)
		
		const user = await User.findByIdAndUpdate(req.user.id,{
			password:newPassword
		})
		generateSendJWT(user, 200, res)
	}),
	getLikeList: handleErrorAsync(async function(req, res, next) {
		console.log('asd')
		const likeList = await Post.find({
			likes: { $in: [req.user.id] } // 拉出陣列裡有同樣id的
		}).populate({
			path:"user",
			select:"name _id image createdAt"
		});
		console.log(likeList, 'likeList')
		res.status(200).json({
			status: 'success',
			likeList
		});
	}),
}

module.exports = userController;