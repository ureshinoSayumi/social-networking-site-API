var express = require('express');
var router = express.Router();
const postController = require('../controllers/post')
const { isAuth,generateSendJWT } = require('../service/auth');

/* GET users listing. */
router.get('/posts', isAuth, postController.getAllPosts); // 取得所有貼文
router.get('/posts/:id', isAuth, postController.getPost); // 取得單一貼文：
router.get('/post/user/:id', isAuth, postController.getUserPost); // 取得個人所有貼文列表：

router.post('/posts', isAuth, postController.createPost); // 新增貼文：
router.delete('/posts/:id', isAuth, postController.deletePost); // 刪除單一貼文：

router.post('/post/:id/like', isAuth, postController.likes); // 新增一則貼文的讚：
router.delete('/post/:id/unlike', isAuth, postController.deleteLikes); // 取消一則貼文的讚：
router.patch('/post/:id', isAuth, postController.updatePost); // 編輯貼文 待修改

router.delete('/posts', isAuth, postController.deleteAllPost); // 刪除所有貼文
router.post('/posts/:id/comment', isAuth, postController.comment); // 新增一則貼文的留言
router.delete('/posts/:id/comment', isAuth, postController.deleteComment); // 新增一則貼文的留言
router.patch('/posts/:id/comment', isAuth, postController.updateComment); // 編輯貼文 待修改

module.exports = router;
