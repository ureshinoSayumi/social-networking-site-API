const appError = (httpStatus, errMessage, next) => {
    const error = new Error(errMessage)
    error.statusCode = httpStatus
    error.isOperational = true
    next(error) // 如果帶入的是err物件，會自動代到第一個參數是err的function
}
module.exports = appError