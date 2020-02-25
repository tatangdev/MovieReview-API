exports.success = (res, message, data, statusCode) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data
    })
}

exports.fail = (res, message, err, statusCode) => {
    return res.status(statusCode).json({
        status: false,
        message,
        errors: err
    })
}