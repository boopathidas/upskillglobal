const express = require('express');
const { 
  registerStudent, 
  studentLogin, 
  getEnrolledStudents 
} = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', studentLogin);
router.get('/enrolled', getEnrolledStudents);

module.exports = router;
