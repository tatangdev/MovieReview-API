const express = require('express');
const router = express.Router();

const movie = require('../controllers/movie.controller');

router.get('/viewMovie', movie.test)

router.post
// Create Review for Movie
    // Can only create one review each movie
    // Should have property rating
// Show Review
    // Limit amount of data that will be displayed, up to ten entries only (Hint: It is called pagination)
    // Filtering data, show by its Tag or Category
    // Able to do search by movie title using query LIKE
// Update Review
// Share Review
    // Able to share review on current user's profile
// Delete Review
    // Should decrease the overall rating of the Movie

module.exports = router;