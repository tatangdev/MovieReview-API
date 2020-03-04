const express = require('express');
const router = express.Router();

const review = require('../controllers/review.controller');
const validate = require('../middlewares/authenticate')

router.post('/:movie_id', validate, review.createReview)
router.get('/', validate, review.getMyReview)
router.get('/:movie_id', review.getReviewByMovie)
router.put('/:movie_id', validate, review.updateReview)
router.delete('/:movie_id', validate, review.deleteReview)

module.exports = router;
