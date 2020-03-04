const express = require('express');
const router = express.Router();
const upload = require('../services/uploader')
const movie = require('../controllers/movie.controller');
const validate = require('../middlewares/authenticate')

router.post('/addMovies', validate, upload, movie.create)
router.get('/', movie.get)
router.get('/genre=:genre', movie.getByGenre)
router.get('/:_id', movie.movieDetailsById)
router.get('/search=:title', movie.getLike)
router.get('/title=:title', movie.movieDetails)
router.put('/:title/updatePoster', validate, upload, movie.updateImage)
router.put('/:title', validate, movie.update)
router.delete('/:title', validate, movie.delete)

module.exports = router;