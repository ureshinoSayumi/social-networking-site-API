var express = require('express');
var router = express.Router();
const userController = require('../controllers/user')
const { isAuth,generateSendJWT } = require('../service/auth');

/* GET users listing. */
router.get('/users', isAuth, userController.getAllUser); // 取得所有會員
router.post('/user/sign_up', userController.sign_up); // 註冊會員
router.post('/users/sign_in', userController.sign_in); // 登入會員
router.get('/users/profile', isAuth, userController.profile) // 取得個人資料
router.post('/users/updatePassword', isAuth, userController.updatePassword) // 重設密碼
router.patch('/users/updateProfile', isAuth, userController.updateProfile) // 更新個人資料
router.get('/users/getLikeList', isAuth, userController.getLikeList) // 取得個人按讚列表
router.get('/users/following', isAuth, userController.following) // 取得個人追蹤名單

router.get('/users/:id', isAuth, userController.getUser); // 取得單一會員

router.post('/users/:id/follow', isAuth, userController.follow) // 追蹤朋友
router.delete('/users/:id/unfollow', isAuth, userController.unfollow) // 取消追蹤朋友
// following


module.exports = router;