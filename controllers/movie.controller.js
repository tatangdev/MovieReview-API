exports.test = (req, res) => {
    res.send('this is for movie router')
}

const Movie = require('../models/movie.schema')
const { success, failed, successMessage, failedMessage } = require('../helpers/response');

exports.create = (req, res) => {
    // let movie = new Movie({
    //     title: req.body.title,
    //     releaseYears: req.body.releaseYears,
    //     genre: req.body.genre,
    //     duration = req.body.duration,
    //     poster = req.body.poster,
    //     trailer = req.body.trailer,
    //     synopsis = req.body.synopsis
    // })

    Movie.create(req.body)
    .then(data => {
        success(res, 'Movie added', data, 201)
    })
    .catch(err => {
        failed(res, 'Can\'t add movie', err, 422)
    })
}