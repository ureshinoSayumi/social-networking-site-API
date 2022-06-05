const sucessHandle = require('../service/sucessHandle')
const appError = require('../service/appError')
const handleErrorAsync = require('../service/handleErrorAsync')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { isAuth,generateSendJWT } = require('../service/auth')

const userController = {
	getAllUser: handleErrorAsync(async function(req, res, next) {
		if (req.user.auth !== '1') {
			return appError(400, '權限不足', next)
		}
		const newUser = await User.find().populate({
			path: 'followers.user',
			select: 'name image sex'
		})
		.populate({
			path: 'following.user',
			select: 'name image sex'
		}).select('+email')
	  sucessHandle(res, newUser, '取得成功')
	}),
	getUser: handleErrorAsync(async function(req, res, next) {
		const id = req.params.id
		const newUser = await User.findById(id).populate({
			path: 'followers.user',
			select: 'name image sex'
		})
		.populate({
			path: 'following.user',
			select: 'name image sex'
		})
	  sucessHandle(res, newUser, '取得成功')
	}),
	sign_up: handleErrorAsync(async function(req, res, next) {
		let { email, password, confirmPassword, name } = req.body
		const errArt = []
		// 內容不可為空
		if(!email || !password || !confirmPassword || !name){
			errArt.push('內容不可為空')
		}
		if(name.length < 2){
			errArt.push('暱稱需兩個字元以上')
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
			return next(appError("400", errArt, next))
		}
		const checkEmail = await User.find({email})
		if (checkEmail.length) {
			return next(appError("400", '此 Email 已被註冊', next))
		}
		// 加密密碼
		password = await bcrypt.hash(req.body.password,12)
		const newUser = await User.create({
			email,
			password,
			name
		})
		generateSendJWT(newUser, 201, res)
	}),

	sign_in: handleErrorAsync(async function(req, res, next) {
		const { email, password } = req.body
		if (!email || !password) {
			return next(appError( 400,'帳號密碼不可為空',next))
		}
		const user = await User.findOne({ email }).select('+password')
		if (user === null) {
			return next(appError( 400,'無此帳號',next))
		}
		const auth = await bcrypt.compare(password, user.password)
		if(!auth){
			return next(appError(400,'您的密碼不正確',next))
		}
		generateSendJWT(user, 200, res)
	}),

	profile: handleErrorAsync(async function(req, res, next) {
		const newUser = await User.findById(req.user.id).populate({
			path: 'followers.user',
			select: 'name image sex'
		})
		.populate({
			path: 'following.user',
			select: 'name image sex'
		}).select('+email') // email原設定不帶入，這邊手動加回去
		sucessHandle(res, { user: newUser }, '登入驗證成功')
	}),

	updateProfile: handleErrorAsync(async function(req, res, next) {
		const { name, sex, image, auth } = req.body
		if(!name || !sex) {
			return next(appError("400","名字、性別不可為空",next))
		}
		const newUser = await User.findByIdAndUpdate(req.user.id, {
			name: name,
			sex: sex,
			image: image,
			auth: auth
		}, { returnDocument: 'after' })

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
		const likeList = await Post.find({
			likes: { $in: [req.user.id] } // 拉出陣列裡有同樣id的
		}).populate({
			path:"user",
			select:"name _id image createdAt"
		})
		sucessHandle(res, likeList, '所有按讚文章取得成功')
	}),
	follow: handleErrorAsync(async function(req, res, next) {
		if (req.params.id === req.user.id) {
			return next(appError(401,'您無法追蹤自己',next))
		}
		await User.updateOne(
			{
				_id: req.user.id,
				'following.user': { $ne: req.params.id }
			},
			{
				$addToSet: { following: { user: req.params.id } }
			}
		)
		await User.updateOne(
			{
				_id: req.params.id,
				'followers.user': { $ne: req.user.id }
			},
			{
				$addToSet: { followers: { user: req.user.id } }
			}
		)
		sucessHandle(res, null, '您已成功追蹤！')
	}),
	unfollow: handleErrorAsync(async function(req, res, next) {
		
		if (req.params.id === req.user.id) {
			return next(appError(401,'您無法取消追蹤自己',next))
		}
		await User.updateOne(
			{
				_id: req.user.id
			},
			{
				$pull: { following: { user: req.params.id } }
			}
		)
		await User.updateOne(
			{
				_id: req.params.id
			},
			{
				$pull: { followers: { user: req.user.id } }
			}
		)
		sucessHandle(res, null, '您已成功取消追蹤！')
	}),
	following: handleErrorAsync(async function(req, res, next) {
		
		if (req.params.id === req.user.id) {
			return next(appError(401,'您無法取消追蹤自己',next))
		}
		const newUser =  await User.findById(req.user.id).populate({
			path: 'following.user',
			select: 'name image'
		})
		sucessHandle(res, newUser.following, '個人資料更改成功')
	}),
}

module.exports = userController