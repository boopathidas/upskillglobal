import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import StudentRegistration from './components/StudentRegistration';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import './App.css';

// Create a more professional Home component
const Home = () => {
  return (
    <div className="home">
      <div className="card">
        <h1>Upskill Global Technology</h1>
        <p>Empowering Learning, Transforming Careers</p>
        <div className="home-actions">
          <Link to="/admin" className="btn btn-primary">Admin Dashboard</Link>
          <Link to="/student-login" className="btn btn-secondary">Student Login</Link>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="navigation">
      <Link to="/">Home</Link>
      <Link to="/admin">Admin Dashboard</Link>
      <Link to="/register">Student Registration</Link>
      <Link to="/student-login">Student Login</Link>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/register" element={<StudentRegistration />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          {/* Redirect any undefined routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
