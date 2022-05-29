const sucessHandle = require('../service/sucessHandle')
const handleErrorAsync = require('../service/handleErrorAsync')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const appError = require('../service/appError')

const postController = {
	getAllPosts: async function(req, res, next) {
		console.log(req.query, 'req.query')
		const timeSort = req.query.timeSort == "asc" ? "createdAt":"-createdAt"
		const q = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {}
		const newPost = await Post.find(q).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		}).sort(timeSort)
		sucessHandle(res, newPost, '取得成功')
	},
	getPost: handleErrorAsync(async (req, res, next) => {
		const postId = req.params.id;
		console.log({postId}, 'postId')
		const newPost = await Post.findById(postId).populate({
			path: 'user',
			select: 'name photo sex image'
		}).populate({
			path: 'likes',
			select: 'name photo sex image'
		})
		sucessHandle(res, [newPost], '取得成功')
  }),
	
	createPost: handleErrorAsync(async function(req, res, next) {
		const createData = req.body
		console.log(createData, 'createData')
		console.log(req.user.id, 'req.user.id')
		if (!createData.content) {
			console.log(createData.content, 'createData.content')
			return appError(400, '單筆建立失敗，貼文內容必填', next)
		}
		if (!createData.user) {
			return appError(400, '單筆建立失敗，使用者ID必填', next)
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
		const id = req.params.id
		const updateData = req.body
		if (!updateData.content) {
			return appError(400, '單筆編輯失敗，貼文內容必填', next)
		}
		if (!updateData.user) {
			return appError(400, '單筆編輯失敗，使用者ID必填', next)
		}
		if (req.user.id !== updateData.user) {
			return appError(400, '無法編輯其他使用者貼文', next)
		}
		const checkUser = await User.findById(updateData.user).catch((err) => null)
		if (checkUser === null) {
			return appError(400, '單筆編輯失敗，無此使用者ID', next)
		}
		// const newUser = await Post.find({id})
		console.log(checkUser)
		console.log(req.user.id, updateData.user)
		const newPost = await Post.findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
		if (newPost === null) {
			return appError(400, '單筆編輯失敗，無此貼文ID', next)
		}
		sucessHandle(res, newPost, '編輯成功')
  }),
	likes: handleErrorAsync(async (req, res, next) => {
		const _id = req.params.id;
    let newPost = await Post.findOneAndUpdate(
			{ _id},
			{ $addToSet: { likes: req.user.id } }
			// addToSet 跟 push 差別
			// push 如果裡面已經有重覆的，一樣會push，addToSet 不會
		);
		res.status(201).json({
			status: 'success',
			postId: _id,
			userId: req.user.id
		});
		console.log(newPost)
  }),
	deleteLikes: handleErrorAsync(async (req, res, next) => {
		const _id = req.params.id;
		await Post.findOneAndUpdate(
			{ _id},
			{ $pull: { likes: req.user.id } }
			// pull 如果有就移除，沒有就不做任何動作
    );
    res.status(201).json({
      status: 'success',
      postId: _id,
      userId: req.user.id
    });
  }),
	deleteAllPost: async (req, res) => {
		const newPost  = await Post.deleteMany({})
		sucessHandle(res, newPost, '成功刪除全部貼文')
  },
}

module.exports = postController;