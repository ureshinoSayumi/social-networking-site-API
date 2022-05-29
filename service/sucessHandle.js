function sucessHandle(res, data, message='sucess') {
    res.status(200).json({
        'status': 'sucess',
        'data': data,
        'message': message
    })
}

module.exports = sucessHandle