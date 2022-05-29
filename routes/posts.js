var express = require('express');
var router = express.Router();
const postController = require('../controllers/post')
const { isAuth,generateSendJWT } = require('../service/auth');

/* GET users listing. */
router.get('/posts', isAuth, postController.getAllPosts);
router.get('/post/:id', isAuth, postController.getPost);
router.post('/post', isAuth, postController.createPost);
router.post('/post/:id/likes', isAuth, postController.likes);
router.delete('/post/:id/deleteLikes', isAuth, postController.deleteLikes);
router.patch('/post/:id', isAuth, postController.updatePost);
router.delete('/posts', isAuth, postController.deleteAllPost);

module.exports = router;
