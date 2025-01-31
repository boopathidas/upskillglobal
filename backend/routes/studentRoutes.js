const express = require('express');
const { registerStudent, studentLogin } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', studentLogin);

module.exports = router;
