var express = require('express');
var router = express.Router();
const postController = require('../controllers/post')
const { isAuth,generateSendJWT } = require('../service/auth');

/* GET users listing. */
router.get('/posts', isAuth, postController.getAllPosts);
router.get('/posts/:id', isAuth, postController.getPost);
router.get('/post/user/:id', isAuth, postController.getUserPost);

router.post('/posts', isAuth, postController.createPost);
router.delete('/posts/:id', isAuth, postController.deletePost);

router.post('/post/:id/like', isAuth, postController.likes);
router.delete('/post/:id/unlike', isAuth, postController.deleteLikes);
router.patch('/post/:id', isAuth, postController.updatePost);

router.delete('/posts', isAuth, postController.deleteAllPost);
router.post('/posts/:id/comment', isAuth, postController.comment);
router.delete('/posts/:id/comment', isAuth, postController.deleteComment);
router.patch('/posts/:id/comment', isAuth, postController.updateComment);

module.exports = router;
