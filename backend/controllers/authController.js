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
  
  // Truncate to ensure username is not too long
  const truncFirstName = sanitizedFirstName.slice(0, 10);
  const truncLastName = sanitizedLastName.slice(0, 10);
  
  const currentYear = new Date().getFullYear();
  
  // Create a consistent username format
  return `${truncFirstName}${truncLastName}${currentYear}`.toLowerCase();
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

    // Validate input
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: validationErrors 
      });
    }

    // Normalize gender
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

    // Find course by name if a string is provided
    let courseId = null;
    if (course) {
      try {
        console.log('Attempting to find course:', course);
        
        // Log all courses for debugging
        const allCourses = await Course.find({});
        console.log('All available courses:', allCourses.map(c => c.name));
        
        const foundCourse = await Course.findOne({ name: course });
        
        console.log('Found course:', foundCourse);
        
        if (foundCourse) {
          courseId = foundCourse._id;
        } else {
          console.warn(`Course not found: ${course}`);
          // If course not found, log a warning but continue
          return res.status(400).json({
            message: 'Validation Error',
            errors: [{
              field: 'course',
              message: `Course "${course}" not found. Available courses: ${allCourses.map(c => c.name).join(', ')}`
            }]
          });
        }
      } catch (courseError) {
        console.error('Error finding course:', courseError);
        return res.status(500).json({
          message: 'Internal Server Error',
          error: 'Could not process course selection'
        });
      }
    }

    const safeFirstName = String(firstName).trim();
    const safeLastName = String(lastName).trim();
    const fullName = `${safeFirstName} ${safeLastName}`;

    // Generate username and password
    const currentYear = new Date().getFullYear();
    const username = generateUsername(safeFirstName, safeLastName);
    const password = `student_${currentYear}`;

    // Add logging to track username generation
    console.log('Generated credentials:', { 
      firstName: safeFirstName, 
      lastName: safeLastName,
      username, 
      password 
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare student data with extensive null checks
    const studentData = {
      fullName,
      username,
      password: hashedPassword,
      email,
      mobileNumber: phone,
      course: courseId,
      qualification: educationLevel || '',
      gender: normalizedGender,
      address: {
        street: address || '',
        city: city || '',
        state: state || '',
        country: country || ''
      },
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      emergencyContact: {
        name: emergencyContactName || '',
        phone: emergencyContactPhone || ''
      }
    };

    // Create and save student
    const student = new Student(studentData);

    try {
      const savedStudent = await student.save();
      
      console.log('Student registered successfully:', savedStudent);
      
      res.status(201).json({
        message: 'Student registered successfully',
        username,
        password
      });
    } catch (saveError) {
      console.error('Error saving student:', saveError);
      
      // Handle specific Mongoose validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({ 
          message: 'Validation Error', 
          errors 
        });
      }

      // Handle duplicate key errors
      if (saveError.code === 11000) {
        const duplicateField = Object.keys(saveError.keyPattern)[0];
        return res.status(409).json({ 
          message: 'Duplicate Entry', 
          field: duplicateField 
        });
      }

      // Generic save error
      return res.status(500).json({ 
        message: 'Error saving student', 
        error: saveError.message,
        details: saveError.toString()
      });
    }
  } catch (error) {
    console.error('Unexpected registration error:', error);
    
    // Comprehensive error response
    res.status(500).json({ 
      message: 'Unexpected error during registration', 
      error: error.message,
      details: error.toString(),
      stack: error.stack 
    });
  } finally {
    console.log('===== REGISTRATION REQUEST END =====');
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
    console.error('Error during login:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
