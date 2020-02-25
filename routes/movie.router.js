const express = require('express');
const router = express.Router();

const movie = require('../controllers/movie.controller');

router.get('/viewMovie', movie.test)

module.exports = router;