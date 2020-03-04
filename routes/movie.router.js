const express = require('express');
const router = express.Router();
const upload = require('../services/uploader')
const movie = require('../controllers/movie.controller');
const validate = require('../middlewares/authenticate')

// create movie
router.post('/addMovies', validate, upload, movie.create)

// get all movie
router.get('/', movie.get)

// get movie by genre
router.get('/genre=:genre', movie.getByGenre)

// get movie details
router.get('/id=:movie_id', movie.detailsById)
router.get('/title=:movie_title', movie.detailsByTitle)

// search movie 
router.get('/search=:movie_title', movie.getLike)

// update poster
router.put('/:movie_id/updatePoster', validate, upload, movie.updateImage)

// update review
router.put('/:movie_id', validate, movie.update)

// delete review
router.delete('/:movie_id', validate, movie.delete)

module.exports = router;