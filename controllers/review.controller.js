const Movie = require('../models/movie.schema')
const Review = require('../models/review.schema')
const jwt = require('jsonwebtoken')
const { success, failed, failedMessage } = require('../helpers/response')

exports.createReview = async (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)

    let review = new Review({
        movie: req.params.movie_id,
        owner: user._id,
        rating: req.body.rating,
        title: req.body.title,
        description: req.body.description
    })

    Review.findOne({ movie: req.params.movie_id, owner: user._id })
        .then(data => {
            if (data) return failedMessage(res, 'kamu sudah review ini', 422)
            Movie.update({ _id: req.params.movie_id }, { $push: { ratings: review._id } })
                .then(data2 => {
                    if (!data2.nModified) return failedMessage(res, 'can\'t create review, movie not found', 422)
                    return Review.create(review)
                })
                .then(result => success(res, 'review created', result, 422))
                .catch(err => failed(res, 'can\'t create review', err, 422))
        })
        .catch(err => failed(res, 'can\'t create review', err, 422))
}

// get my review
exports.getMyReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)

    let page = parseInt(req.query.page)
    Review.paginate({ owner: user._id }, { page, limit: 10, populate: 'owner' })
        .then(data => {
            if (!data) return failedMessage(res, 'Can\'t find review', 422)
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// get review by movie
exports.getReviewByMovie = (req, res) => {
    let page = parseInt(req.query.page)
    Review.paginate({ movie: req.params.movie_id }, { page, limit: 10, populate: 'owner' })
        .then(data => {
            if (!data) return failedMessage(res, 'Can\'t find review', 422)
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// update review
exports.updateReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    let update = {
        rating: req.body.rating,
        title: req.body.title,
        description: req.body.description
    }
    console.log(`${req.params.movie_id} dan ${user._id}`);
    Review.findOneAndUpdate({ movie: req.params.movie_id, owner: user._id }, update)
        .then(data => {
            console.log(data);
            if (!data) return failedMessage(res, 'Can\'t find review', 422)
            success(res, 'review updated', { ...data._doc, ...update }, 200)
        })
        .catch(err => failed(res, 'fail to update review', err, 422))
}

// delete review
exports.deleteReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    Review.findOneAndDelete({ movie: req.params.movie_id, owner: user._id })
        .then(data => {
            if (!data) return failedMessage(res, 'Can\'t find review', 422)
            success(res, 'success delete data', data, 200)
        })
        .catch(err => failed(res, 'can\'t delete data', err, 422))
}