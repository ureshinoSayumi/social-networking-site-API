const sucessHandle = require('../service/sucessHandle')
const handleErrorAsync = require('../service/handleErrorAsync')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Comment = require('../models/commentsModel')
const appError = require('../service/appError')

const postController = {
	getAllPosts: handleErrorAsync(async (req, res, next) => {
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const page = req.query.page
		const rows = page ? 10 : 0
		let skip
		if (page == 1 || !page) {
			skip = 0
		} else {
			skip = (page-1) * 10
		}
		const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {}
		const newPost = await Post.find(q).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		}).populate({
			path: 'comments',
			select: 'comment user createdAt'
		}).sort(timeSort).limit(rows).skip(skip)
		const a = await Comment.find({})
		sucessHandle(res, newPost, '取得成功')
	}),
	getPost: handleErrorAsync(async (req, res, next) => {
		const postId = req.params.id
		const newPost = await Post.findById(postId).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		}).populate({
			path: 'comments',
			select: 'comment user createdAt'
		})
		sucessHandle(res, [newPost], '取得成功')
  }),
	getUserPost: handleErrorAsync(async (req, res, next) => {
		const user = req.params.id
		const newUser = await User.findById(user)
		if (newUser === null) {
			return appError(400, '無此使用者', next)
		}
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const page = req.query.page
		const rows = page ? 10 : 0
		let skip
		if (page == 1 || !page) {
			skip = 0
		} else {
			skip = (page-1) * 10
		}
		let filtet = {
			user
		}
		if (req.query.q) {
			filtet.content = new RegExp(req.query.q)
		}
		const newPost = await Post.find(filtet).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		}).populate({
			path: 'comments',
			select: 'comment user createdAt'
		}).sort(timeSort).limit(rows).skip(skip)
		sucessHandle(res, newPost, '取得成功') 
  	}),
	createPost: handleErrorAsync(async function(req, res, next) {
		const createData = req.body
		if (!createData.content) {
			return appError(400, '單筆建立失敗，貼文內容必填', next)
		}
		const checkUser = await User.findById(req.user.id).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆建立失敗，無此使用者ID', next)
		}
		createData.user = req.user.id
		const newPost = await Post.create(createData)
		sucessHandle(res, newPost, '建立成功')
	}),
	updatePost: handleErrorAsync(async (req, res, next) => {
		const checkUser = await User.findById(req.user.id).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆編輯失敗，無此使用者ID', next)
		}
		const checkPost = await Post.findById(req.params.id).populate({
			path: 'user',
			select: 'name'
		})
		if (checkPost === null) {
			return appError(400, '單筆編輯失敗，無此貼文ID', next)
		}
		if (checkPost.user._id != req.user.id && req.user.auth !== '1') {
			return appError(400, '無法編輯其他用戶貼文', next)
		}
		
		const updateData = req.body
		if (!updateData.content) {
			return appError(400, '單筆編輯失敗，貼文內容必填', next)
		}
		
		const newPost = await Post.findByIdAndUpdate(
			req.params.id, updateData, { returnDocument: 'after' }
		)
		if (newPost === null) {
			return appError(400, '單筆編輯失敗，無此貼文ID', next)
		}
		sucessHandle(res, newPost, '編輯成功')
  }),
	deletePost: handleErrorAsync(async function(req, res, next) {
		const checkUser = await User.findById(req.user.id).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆刪除失敗，無此使用者ID', next)
		}

		const checkPost = await Post.findById(req.params.id).populate({
			path: 'user',
			select: 'name'
		})
		if (checkPost === null) {
			return appError(400, '單筆刪除失敗，無此貼文ID', next)
		}
		if (checkPost.user._id != req.user.id && req.user.auth !== '1') {
			return appError(400, '無法刪除其他用戶貼文', next)
		}
		const newPost = await Post.deleteOne(
			{ _id: req.params.id }
		)
		// 刪除貼文後一併刪除所有留言
		await Comment.deleteMany(
			{ "post": req.params.id }
		)
		sucessHandle(res, newPost, '刪除成功')
	}),
	comment: handleErrorAsync(async (req, res, next) => {
		const user = req.user.id
		const post = req.params.id
		const {comment} = req.body
		const newComment = await Comment.create({
			post,
			user,
			comment
		})
		res.status(201).json({
			status: 'success',
			data: {
				comments: newComment
			}
		})
  }),
	updateComment: handleErrorAsync(async (req, res, next) => {
		const checkUser = await User.findById(req.user.id).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆編輯失敗，無此使用者ID', next)
		}
		const checkComment = await Comment.findById(req.params.id).populate({
			path: 'user',
			select: 'name'
		})
		if (checkComment === null) {
			return appError(400, '單筆編輯失敗，無此留言ID', next)
		}
		if (checkComment.user._id != req.user.id && req.user.auth !== '1') {
			return appError(400, '無法編輯其他用戶留言', next)
		}
		
		const updateData = req.body
		if (!updateData.comment) {
			return appError(400, '單筆編輯失敗，留言內容必填', next)
		}
		
		const newComment = await Comment.findByIdAndUpdate(
			req.params.id, updateData, { returnDocument: 'after' }
		)
		if (newComment === null) {
			return appError(400, '單筆編輯失敗，無此留言ID', next)
		}
		sucessHandle(res, newComment, '編輯成功')
  }),
	deleteComment: handleErrorAsync(async function(req, res, next) {
		const checkUser = await User.findById(req.user.id).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆刪除失敗，無此使用者ID', next)
		}

		const checkComment = await Comment.findById(req.params.id).populate({
			path: 'user',
			select: 'name'
		})
		if (checkComment === null) {
			return appError(400, '單筆刪除失敗，無此留言ID', next)
		}
		if (checkComment.user._id != req.user.id && req.user.auth !== '1') {
			return appError(400, '無法刪除其他用戶留言', next)
		}
		const newComment = await Comment.deleteOne(
			{ _id: req.params.id }
		)
		sucessHandle(res, newComment, '刪除成功')
	}),
	likes: handleErrorAsync(async (req, res, next) => {
		const _id = req.params.id
    let newPost = await Post.findOneAndUpdate(
			{ _id},
			{ $addToSet: { likes: req.user.id } }
			// addToSet 跟 push 差別
			// push 如果裡面已經有重覆的，一樣會push，addToSet 不會
		)
		sucessHandle(res, newPost, '成功按讚', 201)
  }),
	deleteLikes: handleErrorAsync(async (req, res, next) => {
		const _id = req.params.id
		const newPost = await Post.findOneAndUpdate(
			{ _id},
			{ $pull: { likes: req.user.id } }
			// pull 如果有就移除，沒有就不做任何動作
    )
		sucessHandle(res, newPost, '成功收回讚', 201)
  }),
	deleteAllPost: handleErrorAsync(async (req, res, next) => {
		const newPost  = await Post.deleteMany({})
		sucessHandle(res, newPost, '成功刪除全部貼文')
  }),
}

module.exports = postController