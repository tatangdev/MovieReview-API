const Movie = require('../models/movie.schema');
const jwt = require('jsonwebtoken');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');
const Imagekit = require('imagekit');
const mongoose = require('mongoose');

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

// add movie -> oke
exports.create = (req, res) => {
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

// get all movie -> oke
exports.get = (req, res) => {
    let page = parseInt(req.query.page)
    Movie.paginate({}, { page, limit: 10 })
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// movie details by id -> oke
exports.detailsById = (req, res) => {
    Movie.aggregate([
        {
            $match: {
                _id: { $eq: mongoose.mongo.ObjectID(req.params.id) }
            }
        },
        {
            $group: {
                _id: {
                    _id: `$_id`,
                    ratings: `$ratings`
                },
            }
        }, {
            $lookup: {
                from: 'movies',
                localField: "_id._id",
                foreignField: '_id',
                as: 'movie_detail'
            }
        }, {
            $lookup: {
                from: 'reviews',
                localField: "_id.ratings",
                foreignField: '_id',
                as: 'review_detail'
            }
        }, {
            $group: {
                _id: {
                    movie_detail: `$movie_detail`,
                    ratings_detail: `$review_detail`,
                    ratingAverage: { $avg: "$review_detail.rating" }
                },
            }
        },
    ]).then(result => {
        return success(res, 'success get details movie', {
            ...{
                movie_details: result[0]._id.movie_detail,
                ...{ movie_rating: result[0]._id.ratingAverage },
                ...{ movie_reviews: result[0]._id.ratings_detail }
            }
        }, 200)
    }).catch(err => {
        return res.status(500).json({ err: err })
    })
}

// update movie poster -> oke
exports.updateImage = (req, res) => {
    imagekitInstance
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date()}`
        })
        .then(async data => {
            return Movie.findOneAndUpdate({ _id: req.params.movie_id }, { poster: data.url }, (error, document, result) => {
                let newResponse = {
                    ...document._doc,
                    poster: data.url
                }
                success(res, `successfully updated poster`, newResponse, 200)
            })
        })
        .catch(err => failed(res, 'fail to update poster', err, 422))
}

// update movie detail -> oke
exports.update = (req, res) => {
    console.log(req.body.title);
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
    let say = capitalSpace(req.body.title)
    console.log(`aaaaaa ${say}`);

    cleanObject(updateValue)

    Movie.findOneAndUpdate({ _id: req.params.movie_id }, updateValue)
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

    Movie.findOneAndDelete({ _id: req.params.movie_id })
        .then(data => {
            if (!data) return failedMessage(res, 'movie not found', 422)
            success(res, `${data.title} has deleted.`, data, 200)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

exports.result = (req, res, next) => {
    const {
        field,
        value
    } = req.query;
    let page = parseInt(req.query.page)
    let skip = 0
    const limit = 10
    if (page > 1) {
        skip = (page - 1) * limit
    }
    let query = {}
    if (field == "genre" && value != "") {
        query = {
            [field]: { $in: [capitalSpace(value)] }
        }
    } else if (field == "title" && value != "") {
        query = {
            [field]: { $regex: '.*' + capitalUnderscore(value) + '.*' }
        }
    }
    Movie.aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: {
                    _id: `$_id`,
                    ratings: `$ratings`
                },
            }
        }, {
            $lookup: {
                from: 'movies',
                localField: "_id._id",
                foreignField: '_id',
                as: 'movie_detail'
            }
        }, {
            $lookup: {
                from: 'reviews',
                localField: "_id.ratings",
                foreignField: '_id',
                as: 'review_detail'
            }
        }, {
            $group: {
                _id: {
                    movie_detail: `$movie_detail`,
                    ratingAverage: { $avg: "$review_detail.rating" }
                },
            }
        }, {
            $facet: {
                edges: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                pageInfo: [
                    { $group: { _id: null, count: { $sum: 1 } } },
                ],
            },
        }
    ]).then(data => {
        let objArray = data[0].edges
        let result = objArray.map(({ _id }) => _id)
            
        return success(res, 'success get movies', result, 200)

        return res.status(200).json({ result: result })
    }).catch(err => {
        return res.status(500).json({ err: err })
    })
}