const express = require('express');
const router = express.Router();

const review = require('../controllers/review.controller');
const validate = require('../middlewares/authenticate')

router.post('/:movieId', validate, review.createReview)

module.exports = router;