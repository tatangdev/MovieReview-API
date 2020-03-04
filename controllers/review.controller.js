const Movie = require('../models/movie.schema')
const Review = require('../models/review.schema')
const jwt = require('jsonwebtoken')
const { success, failed, failedMessage } = require('../helpers/response')

exports.createReview = async (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)

    let review = new Review({
        movie: req.params.movie_id,
        owner: user._id,
        rate: req.body.rate,
        title: req.body.title,
        description: req.body.description
    })

    Review.findOne({ movie: review.movie, owner: user._id })
        .then(data => {
            if (data) return failedMessage(res, 'You are already reviewing this film', 422)
            return Review.create(review)
        })
        .then(result => success(res, 'success added review', result, 201))
        .catch(err => failed(res, 'failed add review', err, 422))
}

// get my review
exports.getMyReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)

    let page = parseInt(req.query.page)
    Review.paginate({ owner: user._id }, { page, limit: 10 })
        .then(data => {
            if (!data) return failedMessage(res, 'Can\'t find review', 422)
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

// get review by movie
exports.getReviewByMovie = (req, res) => {
    let page = parseInt(req.query.page)
    Review.paginate({ movie: req.params.movie_id }, { page, limit: 10 })
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
        rate: req.body.rate,
        title: req.body.title,
        description: req.body.description
    }
    Review.findOneAndUpdate({ movie: req.params.movie_id, owner: user._id }, update)
        .then(data => {
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