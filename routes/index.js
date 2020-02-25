const express = require('express');
const router = express.Router();
const user = require('./user.router');
const movie = require('./movie.router');
const review = require('./review.router');

router.use('/user', user);
router.use('/movie', movie);
router.use('/review', review);

module.exports = router;