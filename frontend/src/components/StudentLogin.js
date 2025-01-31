import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { username });
      const response = await axios.post('/api/students/login', { username, password });
      
      console.log('Login response:', response.data);
      
      // Store user info in local storage
      localStorage.setItem('studentToken', response.data.token);
      localStorage.setItem('studentId', response.data.studentId);
      
      // Redirect to student dashboard
      navigate('/student-dashboard');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="student-login-container">
      <div className="login-wrapper">
        <h2>Student Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
