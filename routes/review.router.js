const express = require('express');
const router = express.Router();

const review = require('../controllers/review.controller');

router.get('/viewReview', review.test)

module.exports = router;