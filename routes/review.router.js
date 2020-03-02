const express = require('express');
const router = express.Router();

const review = require('../controllers/review.controller');
const validate = require('../middlewares/authenticate')

router.post('/:title', validate, review.createReview)
router.get('/:title', review.getReview)
router.put('/:title', validate, review.updateReview)
router.delete('/:title', validate, review.deleteReview)

module.exports = router;
