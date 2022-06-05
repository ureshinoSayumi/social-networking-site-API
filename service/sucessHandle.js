function sucessHandle(res, data, message='sucess', httpStatus=200) {
    res.status(httpStatus).json({
        'status': 'sucess',
        'data': data,
        'message': message
    })
}

module.exports = sucessHandle