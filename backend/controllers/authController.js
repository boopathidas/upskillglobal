const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Helper function for validation
function validateInput(data) {
  const errors = [];

  // Validate name
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters long' });
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters long' });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  // Validate phone number
  const phoneRegex = /^[0-9]{10}$/;
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Please provide a valid 10-digit phone number' });
  }

  // Validate date of birth
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (dob > new Date()) {
      errors.push({ field: 'dateOfBirth', message: 'Date of birth cannot be in the future' });
    }
  }

  // Validate gender (case-insensitive)
  const validGenders = ['Male', 'Female', 'Other'];
  if (data.gender && !validGenders.some(g => g.toLowerCase() === data.gender.toLowerCase())) {
    errors.push({ 
      field: 'gender', 
      message: `Gender must be one of: ${validGenders.join(', ')}` 
    });
  }

  // Validate emergency contact phone if provided
  if (data.emergencyContactPhone && !phoneRegex.test(data.emergencyContactPhone)) {
    errors.push({ 
      field: 'emergencyContactPhone', 
      message: 'Emergency contact phone must be a 10-digit number' 
    });
  }

  return errors;
}

// Username generation function
function generateUsername(firstName, lastName) {
  // Remove any non-alphanumeric characters and convert to lowercase
  const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Use first 4 chars of first name and last name
  const truncFirstName = sanitizedFirstName.slice(0, 4);
  const truncLastName = sanitizedLastName.slice(0, 4);
  
  const currentYear = new Date().getFullYear();
  
  // Create a consistent username format
  return `${truncFirstName}${truncLastName}${currentYear}`.toLowerCase();
}

// Password generation function
function generatePassword() {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

exports.registerStudent = async (req, res) => {
  console.log('===== FULL REGISTRATION REQUEST START =====');
  console.log('Received request body:', JSON.stringify(req.body, null, 2));

  try {
    // Destructure with default empty strings to prevent undefined errors
    const { 
      firstName = '', 
      lastName = '', 
      email = '', 
      phone = '', 
      dateOfBirth = null, 
      gender = 'Other', 
      address = '', 
      city = '', 
      state = '', 
      country = '', 
      course = null, 
      educationLevel = '',
      emergencyContactName = '',
      emergencyContactPhone = ''
    } = req.body;

    // Normalize gender
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

    // Validate input
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email already exists' 
      });
    }

    // Generate unique username
    const username = generateUsername(firstName, lastName);
    
    // Generate password
    const password = generatePassword();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const newStudent = new Student({
      fullName: `${firstName} ${lastName}`,
      username,
      password: hashedPassword,
      email,
      mobileNumber: phone,
      course: course ? await Course.findOne({ name: course }) : null,
      qualification: educationLevel,
      gender: normalizedGender,
      dateOfBirth,
      address: {
        street: address,
        city,
        state,
        country
      },
      emergencyContact: {
        name: emergencyContactName,
        mobileNumber: emergencyContactPhone
      }
    });

    // Save student
    await newStudent.save();

    // Respond with success and credentials
    res.status(201).json({
      message: 'Student registered successfully',
      username: username,
      password: password  // Send plain text password for initial login
    });
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    });

    // Check for specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Generic server error response
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log incoming login attempt
    console.log('Login attempt:', { username });

    // Find student with more detailed logging
    const student = await Student.findOne({ username });
    
    if (!student) {
      console.error('Invalid credentials: Student not found', { 
        username, 
        message: 'No student found with this username' 
      });
      
      // Find similar usernames for debugging
      const similarUsers = await Student.find({ 
        username: { $regex: username, $options: 'i' } 
      }).select('username');
      
      console.log('Similar usernames found:', similarUsers.map(u => u.username));
      
      return res.status(400).json({ 
        message: 'Invalid credentials', 
        details: 'No student found with this username' 
      });
    }

    // Detailed password comparison logging
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      console.error('Invalid credentials: Password mismatch', { 
        username, 
        message: 'Provided password does not match stored password' 
      });
      
      return res.status(400).json({ 
        message: 'Invalid credentials', 
        details: 'Incorrect password' 
      });
    }

    const token = jwt.sign(
      { id: student._id, username: student.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      student: {
        id: student._id,
        username: student.username,
        course: student.course
      }
    });
  } catch (error) {
    console.error('Error during login:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    });

    // Generic server error response
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getEnrolledStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('course', 'name')  // Populate course details
      .select('fullName email course createdAt')
      .sort({ createdAt: -1 });  // Sort by most recent first

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching enrolled students:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    });

    // Generic server error response
    res.status(500).json({ 
      message: 'Failed to fetch enrolled students', 
      error: error.message 
    });
  }
};
