const Movie = require('../models/movie.schema')
const Review = require('../models/review.schema')
const jwt = require('jsonwebtoken');
const { success, failed, successMessage, failedMessage } = require('../helpers/response');

// capital letter
function capitalUnderscore(str) {
    str = str.split("_");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

exports.createReview = async (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    console.log(user._id);

    let review = new Review({
        movie: capitalUnderscore(req.params.title),
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

exports.getReview = (req, res) => {
    let page = parseInt(req.query.page)
    Review.paginate({ movie: capitalUnderscore(req.params.title) }, { page, limit: 10 })
        .then(data => {
            success(res, 'success', data, 201)
        })
        .catch(err => failed(res, 'failed', err, 422))
}

exports.updateReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    let update = {
        rate: req.body.rate,
        title: req.body.title,
        description: req.body.description
    }
    Review.findOneAndUpdate({ movie: capitalUnderscore(req.params.title), owner: user._id }, update)
        .then(data => success(res, 'review updated', { ...data._doc, ...update }, 200))
        .catch(err => failed(res, 'fail to update review', err, 422))
}

exports.deleteReview = (req, res) => {
    let user = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    Review.findOneAndDelete({ movie: capitalUnderscore(req.params.title) })
        .then(data => success(res, 'success delete data', data, 200))
        .catch(err => failed(res, 'can\'t delete data', err, 422))
}