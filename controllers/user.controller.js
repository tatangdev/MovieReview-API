const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');
const mailer = require('../services/mailer')
const Imagekit = require('imagekit')

const imagekitInstance = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}`
});

// user register
exports.userRegister = (req, res) => {
    if (req.body.password != req.body.password_confirmation) return failedMessage(
        res, 'Password doesn\'t match', 422)

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    })

    User.create(user)
        .then(data => {
            let token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY)
            mailer.send({
                from: 'no-reply@MovieApp.com',
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

// admin register
exports.adminRegister = (req, res) => {
    if (req.body.password != req.body.password_confirmation) return failedMessage(
        res, 'Password doesn\'t match', 422)

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
                from: 'no-reply@MovieApp',
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

// activate user
exports.activation = (req, res) => {
    let user = jwt.verify(req.params.token, process.env.SECRET_KEY)

    User.findOneAndUpdate({ _id: user._id }, { isConfirmed: true })
        .then(data => {
            success(res, 'Your email is verified now.', data, 201)
        })
        .catch(err => failedMessage(res, err, 422))
}

// login user
exports.login = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(data => {
            // check data availability
            if (!data) return failedMessage(
                res, `That email and password combination didn't work. Try again.`, 403)

            // check password
            if (!bcrypt.compareSync(req.body.password, data.password)) return failedMessage(
                res, `That email and password combination didn't work. Try again.`, 403)

            // check verified status
            if (!data.isConfirmed) return failedMessage(
                res, 'Email isn\'t verified, please check your email!', 403)

            // generate token
            let token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY)

            // success respon
            success(res, 'Successfuly login', {
                _id: data._id,
                name: data.name,
                email: data.email,
                image: data.image,
                token
            }, 200)
        })
        .catch(err => {
            failedMessage(res, err, 422)
        })
}

// request link to change password
exports.forgot = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(data => {

            let token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY)

            return mailer.send({
                from: 'no-reply@MovieApp.com',
                to: data.email,
                subject: 'Reset password',
                html: `
          <p> Hai, ${data.name}. segera ganti password anda dengan menekan tombol dibawah.</p>
          <a href="${process.env.BASE_URL}/api/user/reset/${token}">Click here</a>`
            })
        })
        .then(() => {
            successMessage(res, `If a MovieApp account for ${req.body.email} exists, you will receive an email with a link to reset your password.`, 200)
        })
        .catch(() => {
            successMessage(res, `If a MovieApp account for ${req.body.email} exists, you will receive an email with a link to reset your password.`, 200)
        })
}

// reset password // done
exports.reset = (req, res) => {
    let user = jwt.verify(req.params.token, process.env.SECRET_KEY)

    if (req.body.password != req.body.password_confirmation) return failedMessage(
        res, 'Password doesn\'t match!', 403)

    let password = bcrypt.hashSync(req.body.password)

    User.findOneAndUpdate({ _id: user._id }, { password: password })
        .then(data => {
            success(res, 'successfully changed password', data, 201)
        })
        .catch(err => {
            failedMessage(res, err, 422)
        })
}

exports.upload = (req, res) => {
    imagekitInstance
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date()}`
        })
        .then(async data => {
            User.findOneAndUpdate({ _id: req.user._id }, { image: data.url }, (error, document, result) => {
                let newResponse = {
                    ...document._doc,
                    image: data.url
                }
                delete newResponse.password
                success(res, `successfully updated profile`, newResponse, 200)
            })
        })
        .catch(err => {
            res.status(422).json({
                // status:false,
                errors: err
            })
        })
}

// edit profile // done
exports.editProfile = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    User.findOneAndUpdate({ _id: user._id }, { name: req.body.name })
        .select(['-password'])
        .then(data => success(res, 'sukses update', { ...data._doc, name: req.body.name }, 200))
        .catch(err => failedMessage(res, err, 422))

}