function errorHandle(res, message='格式錯誤') {
    res.status(400).json({
        'status': 'false',
        'message': message
    })
}

module.exports = errorHandle