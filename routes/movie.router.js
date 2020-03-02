const express = require('express');
const router = express.Router();
const upload = require('../services/uploader')
const movie = require('../controllers/movie.controller');
const validate = require('../middlewares/authenticate')

router.get('/', movie.get)
router.post('/addMovies', validate, upload, movie.create)
router.put('/:title/updatePoster', validate, upload, movie.updateImage)
router.get('/:title', movie.movieDetails)
router.put('/:title', validate, movie.update)
router.delete('/:title', validate, movie.delete)

module.exports = router;