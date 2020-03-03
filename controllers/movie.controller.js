const Movie = require('../models/movie.schema');
const jwt = require('jsonwebtoken');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');
const Imagekit = require('imagekit');

const imagekitInstance = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}`
});

// split string by space
function capitalSpace(str) {
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

// split string by underscore
function capitalUnderscore(str) {
    str = str.split("_");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

// string to object
function stringObj(words) {
    words = words.split(",");
    for (var i = 0, x = words.length; i < x; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1)
    }
    return words
}

// object cleaner
function cleanObject(obj) {
    for (var propName in obj) {
        if (!obj[propName]) {
            delete obj[propName];
        }
    }
}

// get all movie
exports.get = (req, res) => {
    let page = parseInt(req.query.page)
    Movie.paginate({}, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// get movie by genre
exports.getByGenre = (req, res) => {
    let page = parseInt(req.query.page)
    Movie.paginate({ genre: { $in: [capitalSpace(req.params.genre)] } }, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// get query like
exports.getLike = (req, res) => {
    let page = parseInt(req.query.page)
    Movie.paginate({ title: { $regex: '.*' + capitalUnderscore(req.params.title) + '.*' } }, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// add movie -> oke
exports.create = (req, res) => {
    console.log(stringObj(req.body.genre))
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (!user.privilege) return failedMessage(res, 'You\'re not admin', 422)

    let movie = new Movie({
        title: capitalSpace(req.body.title),
        releaseYear: req.body.releaseYear,
        genre: stringObj(req.body.genre),
        duration: req.body.duration,
        trailer: req.body.trailer,
        synopsis: req.body.synopsis
    })

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
            Movie.findOneAndUpdate({ title: capitalUnderscore(req.params.title) }, { poster: data.url }, (error, document, result) => {
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
    Movie.findOne({ title: capitalUnderscore(req.params.title) })
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
        title: capitalSpace(req.body.title),
        releaseYear: req.body.releaseYear,
        genre: stringObj(req.body.genre),
        duration: req.body.duration,
        trailer: req.body.trailer,
        synopsis: req.body.synopsis
    }

    cleanObject(updateValue)

    Movie.findOneAndUpdate({ title: capitalUnderscore(req.params.title) }, updateValue)
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, 'update success', { ...data._doc, ...updateValue }, 200)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// delete movie -> oke
exports.delete = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (!user.privilege) return failedMessage(res, 'You\'re not admin', 422)

    Movie.findOneAndDelete({ title: capitalUnderscore(req.params.title) })
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, `${data.title} has deleted.`, data, 200)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

exports.searchLike = (req, res) => {
    let page = parseInt(req.query.page)
    Movie.paginate({ genre }, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}