const express = require('express');
const router = express.Router();
const db = require('../../../models');
const { signup, signin, signout, refreshToken,getResetToken, resetPassword } = require('../controllers/auth');
//const { userSignupValidator } = require('../validator');

router.post('/signup',signup);
router.post("/refreshtoken",refreshToken)
router.post("/forgotPassword", getResetToken);
router.post('/resetPassword',resetPassword)
router.post('/signin', signin);

module.exports = router;