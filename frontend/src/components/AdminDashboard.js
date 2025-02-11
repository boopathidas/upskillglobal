import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from '../api/axiosConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [courseData, setCourseData] = useState({
    labels: [],
    datasets: []
  });
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch student count and course data
    const fetchDashboardData = async () => {
      try {
        // Mock data since backend is not fully set up
        setStudentCount(100);
        
        setCourseData({
          labels: ['React', 'Node.js', 'MongoDB'],
          datasets: [{
            label: 'Students per Course',
            data: [40, 30, 30],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }]
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/students/enrolled');
      setEnrolledStudents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setError('Failed to fetch enrolled students');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Students</h3>
                <p>{studentCount}</p>
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-container">
                <h2>Course Enrollment</h2>
                <Bar 
                  data={courseData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Course Enrollment Distribution'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </>
        );
      case 'course-registration':
        return <div>Course Registration Form</div>;
      case 'trainer-registration':
        return <div>Trainer Registration Form</div>;
      case 'enrolled-students':
        return (
          <div className="enrolled-students-container">
            <h2>Enrolled Students</h2>
            {loading ? (
              <p>Loading students...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : enrolledStudents.length === 0 ? (
              <p>No students enrolled yet.</p>
            ) : (
              <table className="enrolled-students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => (
                    <tr key={student._id}>
                      <td>{`${student.firstName} ${student.lastName}`}</td>
                      <td>{student.email}</td>
                      <td>{student.course?.name || 'N/A'}</td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (activeSection === 'enrolled-students') {
      fetchEnrolledStudents();
    }
  }, [activeSection]);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>Upskill Global</h2>
        </div>
        <nav className="sidebar-menu">
          <button 
            className={activeSection === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveSection('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeSection === 'course-registration' ? 'active' : ''}
            onClick={() => setActiveSection('course-registration')}
          >
            Course Registration
          </button>
          <button 
            className={activeSection === 'trainer-registration' ? 'active' : ''}
            onClick={() => setActiveSection('trainer-registration')}
          >
            Trainer Registration
          </button>
          <button 
            className={activeSection === 'enrolled-students' ? 'active' : ''}
            onClick={() => setActiveSection('enrolled-students')}
          >
            Enrolled Students
          </button>
        </nav>
      </div>
      <div className="admin-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
