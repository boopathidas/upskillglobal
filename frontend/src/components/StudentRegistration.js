import React, { useState } from 'react';
import axios from '../api/axiosConfig';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    course: '',
    educationLevel: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loginCredentials, setLoginCredentials] = useState(null);

  const courses = [
    'React Fundamentals',
    'Node.js Backend Development',
    'Full Stack Web Development',
    'Data Science with Python',
    'Cloud Computing',
  ];

  const generateLoginCredentials = (firstName, lastName) => {
    // Generate username: first initial + last name
    const username = `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`;
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    
    return { username, password };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.course) newErrors.course = 'Course selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset submit status and login credentials
    setSubmitStatus(null);
    setLoginCredentials(null);

    // Validate form
    if (validateForm()) {
      try {
        // Validate date of birth
        const dobDate = new Date(formData.dateOfBirth);
        if (dobDate > new Date()) {
          setSubmitStatus({
            type: 'error',
            message: 'Date of birth cannot be in the future'
          });
          return;
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
          setSubmitStatus({
            type: 'error',
            message: 'Please provide a valid 10-digit phone number'
          });
          return;
        }

        // Validate emergency contact phone if provided
        if (formData.emergencyContactPhone && 
            !phoneRegex.test(formData.emergencyContactPhone)) {
          setSubmitStatus({
            type: 'error',
            message: 'Emergency contact phone must be a 10-digit number'
          });
          return;
        }

        // Normalize gender
        const normalizedGender = 
          formData.gender ? 
          formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase() : 
          'Other';

        // Generate login credentials
        const credentials = generateLoginCredentials(formData.firstName, formData.lastName);
        
        // Prepare full registration data
        const registrationData = {
          ...formData,
          username: credentials.username,
          password: credentials.password,
          gender: normalizedGender,
          // Ensure course is passed as a string name
          course: formData.course || null
        };

        console.log('Attempting student registration:', registrationData);

        // Update registration endpoint
        const response = await axios.post('/api/students/register', registrationData);
        
        console.log('Registration response:', response.data);
        
        // Set login credentials to display
        setLoginCredentials(credentials);
        
        setSubmitStatus({
          type: 'success',
          message: 'Student registered successfully!'
        });

        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          country: '',
          course: '',
          educationLevel: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
      } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        
        // Handle different types of errors
        if (error.response && error.response.data.errors) {
          // Handle validation errors from backend
          const errorMessages = error.response.data.errors
            .map(err => `${err.field}: ${err.message}`)
            .join('; ');
          
          setSubmitStatus({
            type: 'error',
            message: errorMessages
          });
        } else {
          // Generic error handling
          const errorMessage = error.response?.data?.message || 
                               'Registration failed. Please try again.';
          
          setSubmitStatus({
            type: 'error',
            message: errorMessage
          });
        }
      }
    }
  };

  return (
    <div className="student-registration-container">
      <div className="registration-form-wrapper">
        <h2>Student Registration</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? 'input-error' : ''}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'input-error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="course">Course</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={errors.course ? 'input-error' : ''}
              >
                <option value="">Select a Course</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && <span className="error-message">{errors.course}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="educationLevel">Education Level</label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
              >
                <option value="">Select Education Level</option>
                <option value="high-school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="form-section-header">
            <h3>Emergency Contact</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergencyContactName">Emergency Contact Name</label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContactPhone">Emergency Contact Phone</label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="Enter emergency contact number"
              />
            </div>
          </div>

          {submitStatus && (
            <div className={`submit-status ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          {loginCredentials && (
            <div className="login-credentials-popup">
              <h3>Login Credentials</h3>
              <p>Please save these credentials securely:</p>
              <div className="credentials-box">
                <p><strong>Username:</strong> {loginCredentials.username}</p>
                <p><strong>Password:</strong> {loginCredentials.password}</p>
              </div>
              <p className="warning">
                ⚠️ These credentials will only be shown once. 
                Make sure to save them securely.
              </p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Register Student
            </button>
            <button type="reset" className="btn btn-secondary" onClick={() => setFormData({
              firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
              gender: '', address: '', city: '', state: '', country: '',
              course: '', educationLevel: '', emergencyContactName: '',
              emergencyContactPhone: '',
            })}>
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
