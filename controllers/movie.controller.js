const Movie = require('../models/movie.schema')
const User = require('../models/user.schema')
const jwt = require('jsonwebtoken');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');
const Imagekit = require('imagekit')

const imagekitInstance = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}`
});

exports.get = (req, res) => {
    let page = parseInt(req.query.page)

    Movie.paginate({}, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// add movie -> oke
exports.create = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (!user.privilege) return failedMessage(res, 'You\'re not admin', 422)

    let movie = new Movie({
        title: req.body.title,
        releaseYear: req.body.releaseYear,
        genre: req.body.genre,
        duration: req.body.duration,
        trailer: req.body.trailer,
        synopsis: req.body.synopsis
    })

    console.log(movie);

    imagekitInstance
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date()}`
        })
        .then(data => {
            return Movie.create({ ...movie._doc, poster: data.url })
        })
        .then(result => success(res, 'successfully added a film', result, 201))
        .catch(err => failed(res, 'failed to add movie', err, 422))
}

// update movie poster -> oke
exports.updateImage = (req, res) => {
    imagekitInstance
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date()}`
        })
        .then(async data => {
            console.log(data);
            Movie.findOneAndUpdate({ _id: req.params.movieId }, { poster: data.url }, (error, document, result) => {
                let newResponse = {
                    ...document._doc,
                    poster: data.url
                }
                success(res, `successfully updated poster`, newResponse, 200)
            })
        })
        .catch(err => failed(res, 'fail to update poster', err, 422))
}

// movie details -> oke
exports.movieDetails = (req, res) => {
    Movie.findOne({ _id: req.params.movieId })
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, 'movie found', data, 200)
        })
        .catch(err => failed(res, 'ERROR', err, 422))
}

// update movie detail -> oke
exports.update = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (!user.privilege) return failedMessage(res, 'You\'re not admin', 422)

    let updateValue = {
        title: req.body.title,
        releaseYear: req.body.releaseYear,
        genre: req.body.genre,
        duration: req.body.duration,
        trailer: req.body.trailer,
        synopsis: req.body.synopsis
    }

    function cleanObject(obj) {
        for (var propName in obj) {
            if (!obj[propName]) {
                delete obj[propName];
            }
        }
    }
    cleanObject(updateValue);

    Movie.findOneAndUpdate({ _id: req.params.movieId }, updateValue)
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, 'update success', { ...data._doc, updateValue }, 200)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// delete movie -> oke
exports.delete = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (!user.privilege) return failedMessage(res, 'You\'re not admin', 422)

    Movie.findOneAndDelete({ _id: req.params.movieId })
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, `${data.title} has deleted.`, data, 200)
        })
        .catch(err => failed(res, 'failed', err, 422))
}