const express = require('express');
const router = express.Router();
const upload = require('../services/uploader')
const validate = require('../middlewares/authenticate')
const user = require('../controllers/user.controller');

/* register */
router.post('/register', user.userRegister)
router.post('/register/admin', user.adminRegister)
/* activation */
router.get('/activation/:token', user.activation)
/* login */
router.post('/login', user.login)
/* forgot */
router.post('/forgotPassword', user.forgot)
/* reset */
router.put('/resetPassword/:token', user.reset)
/* upload photo */
router.put('/updateImage', validate, upload, user.upload)
/* update profile */
router.put('/updateProfile', validate, user.editProfile)

module.exports = router;