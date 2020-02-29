const express = require('express');
const router = express.Router();
const upload = require('../services/uploader')
const movie = require('../controllers/movie.controller');
const validate = require('../middlewares/authenticate')

router.get('/', movie.get)
router.post('/addMovies', validate, upload, movie.create)
router.put('/:movieId/updatePoster', validate, upload, movie.updateImage)
router.get('/:movieId', validate, movie.movieDetails)
router.put('/:movieId', validate, movie.update)
router.delete('/:movieId', validate, movie.delete)

module.exports = router;