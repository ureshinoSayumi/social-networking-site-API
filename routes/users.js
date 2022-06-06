var express = require('express');
var router = express.Router();
const userController = require('../controllers/user')
const { isAuth,generateSendJWT } = require('../service/auth');

/* GET users listing. */
router.get('/users', isAuth, userController.getAllUser);
router.post('/user/sign_up', userController.sign_up);
router.post('/users/sign_in', userController.sign_in);
router.get('/users/profile', isAuth, userController.profile)
router.post('/users/updatePassword', isAuth, userController.updatePassword)
router.patch('/users/updateProfile', isAuth, userController.updateProfile)
router.get('/users/getLikeList', isAuth, userController.getLikeList)
router.get('/users/following', isAuth, userController.following)

router.get('/users/:id', isAuth, userController.getUser);

router.post('/users/:id/follow', isAuth, userController.follow)
router.delete('/users/:id/unfollow', isAuth, userController.unfollow)


module.exports = router;