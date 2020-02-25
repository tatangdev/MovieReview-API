const express = require('express');
const router = express.Router();

const user = require('../controllers/user.controller');

router.get('/viewUser', user.test)

module.exports = router;