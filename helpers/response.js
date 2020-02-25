exports.success = (res, message, data, statusCode) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data
    })
}

exports.failed = (res, message, err, statusCode) => {
    return res.status(statusCode).json({
        status: false,
        message,
        errors: err
    })
}

exports.successMessage = (res, message, statusCode) => {
    return res.status(statusCode).json({
        status: true,
        message
    })
}

exports.failedMessage = (res, message, statusCode) => {
    return res.status(statusCode).json({
        status: false,
        message
    })
}