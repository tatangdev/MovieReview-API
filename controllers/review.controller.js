const Review = require('../models/review.schema')
const jwt = require('jsonwebtoken');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');

exports.createReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if (req.body.rate < 0 || req.body.rate > 10) return failedMessage(res, 'rate value must be 1-10')

    let review = new Review({
        movie: req.params.movieId,
        owner: user._id,
        rate: req.body.rate,
        review: req.body.review
    })

    Review.findOne({ owner: user._id })
        .then(data => {
            if (data) return failedMessage(res, 'You are already reviewing this film', 422)
            return Review.create(review)
        })
        .then(result => success(res, 'success added review', result, 201))
        .catch(err => failed(res, 'failed add review', err, 422))
}