const express = require('express');
const router = express.Router();

const user = require('../controllers/user.controller');

router.get('/viewUser', user.test)
router.get('/activation/:token', user.activation)
router.post('/register', user.userRegister)
router.post('/register/admin', user.adminRegister)

module.exports = router;