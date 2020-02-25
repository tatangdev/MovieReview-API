const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');
const mailer = require('../services/mailer')
// const Imagekit = require('imagekit')

exports.test = (req, res) => {
    res.send('this is for user router')
}

exports.userRegister = (req, res) => {
    if (req.body.password != req.body.password_confirmation) return failedMessage(res, 'Password doesn\'t match', 422)

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    })

    User.create(user)
        .then(data => {
            let token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY)
            mailer.send({
                from: 'no-reply@ga-todolist.com',
                to: data.email,
                subject: 'User Activation',
                html: `
                <p> Hei, ${data.name}. Please click on the link below to verify your email and continue the registration process.</p>
                <a href="${process.env.BASE_URL}/api/user/activation/${token}">Click here</a>`
            })
            return data
        })
        .then(result => {
            success(res, `A verification link has been sent to your email account. Please click on the link that has just been sent to your email account to verify your email and continue the registration process.`, result, 201)
        })
        .catch(err => failed(res, 'Can\'t create user', err, 422))
}

exports.adminRegister = (req, res) => {
    if (req.body.password != req.body.password_confirmation) return failedMessage(res, 'Password doesn\'t match', 422)

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        privilege: true
    })

    User.create(user)
        .then(data => {
            let token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY)

            mailer.send({
                from: 'no-reply@ga-todolist.com',
                to: data.email,
                subject: 'User Activation',
                html: `
                <p> Hei, ${data.name}. Please click on the link below to verify your email and continue the registration process.</p>
                <a href="${process.env.BASE_URL}/api/user/activation/${token}">Click here</a>`
            })
            return data
        })
        .then(result => {
            success(res, `A verification link has been sent to your email account. Please click on the link that has just been sent to your email account to verify your email and continue the registration process.`, result, 201)
        })
        .catch(err => failed(res, 'Can\'t create user', err, 422))
}

// activate user // done
exports.activation = (req, res) => {
    let user = jwt.verify(req.params.token, process.env.SECRET_KEY)

    User.findOneAndUpdate({ _id: user._id }, { isConfirmed: true })
        .then(data => {
            success(res, 'Your email is verified now.', data, 201)
        })
        .catch(err => {
            failedMessage(res, err, 422)
        })
}