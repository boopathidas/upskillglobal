import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import axios from '../api/axiosConfig';

const courses = {
  'computer-science': {
    name: 'Computer Science Fundamentals',
    topics: [
      { 
        id: 1, 
        name: 'Introduction to Programming', 
        completed: false, 
        assessment: {
          questions: [
            { 
              id: 1, 
              text: 'What is a variable in programming?', 
              options: [
                'A storage location with an associated symbolic name',
                'A type of computer',
                'A programming language',
                'A hardware component'
              ],
              correctAnswer: 0
            },
            { 
              id: 2, 
              text: 'What does CPU stand for?', 
              options: [
                'Computer Processing Unit',
                'Central Processing Unit',
                'Computer Personal Unit',
                'Central Personal Unit'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
      { 
        id: 2, 
        name: 'Data Structures', 
        completed: false, 
        assessment: {
          questions: [
            { 
              id: 1, 
              text: 'What is an array?', 
              options: [
                'A type of loop',
                'A collection of elements stored at contiguous memory locations',
                'A programming language',
                'A type of function'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
      { 
        id: 3, 
        name: 'Algorithms', 
        completed: false, 
        assessment: {
          questions: [
            { 
              id: 1, 
              text: 'What is Big O notation used for?', 
              options: [
                'Designing websites',
                'Analyzing algorithm efficiency',
                'Creating databases',
                'Writing documentation'
              ],
              correctAnswer: 1
            }
          ]
        }
      }
    ]
  }
};

const StudentDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState('computer-science');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);

  useEffect(() => {
    // Fetch student data (mock for now)
    const fetchStudentData = async () => {
      try {
        // eslint-disable-next-line no-unused-vars
        const studentId = localStorage.getItem('studentId');
        // Mock API call
        const studentData = {
          name: 'John Doe',
          enrolledCourses: ['computer-science']
        };
        setSelectedCourse(studentData.enrolledCourses[0]);
      } catch (error) {
        console.error('Error fetching student data', error);
      }
    };

    fetchStudentData();
  }, []);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setAssessmentSubmitted(false);
    setAssessmentAnswers({});
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const submitAssessment = () => {
    const course = courses[selectedCourse];
    const topic = course.topics.find(t => t.id === selectedTopic.id);
    
    const correctAnswers = topic.assessment.questions.filter((q, index) => 
      assessmentAnswers[q.id] === q.correctAnswer
    ).length;

    const totalQuestions = topic.assessment.questions.length;
    const passPercentage = (correctAnswers / totalQuestions) * 100;

    alert(`Assessment Submitted!\nScore: ${correctAnswers}/${totalQuestions} (${passPercentage.toFixed(2)}%)`);
    
    // Mark topic as completed if score is above 70%
    if (passPercentage >= 70) {
      topic.completed = true;
    }

    setAssessmentSubmitted(true);
  };

  const currentCourse = courses[selectedCourse];

  return (
    <div className="student-dashboard-container">
      <div className="student-dashboard">
        <header className="dashboard-header">
          <h1>Welcome, John Doe</h1>
          <p>Enrolled Courses: 1</p>
        </header>

        <div className="course-section">
          <h2>{currentCourse.name}</h2>
          
          <div className="topics-list">
            {currentCourse.topics.map(topic => (
              <div 
                key={topic.id} 
                className={`topic-item ${topic.completed ? 'completed' : ''}`}
                onClick={() => handleTopicSelect(topic)}
              >
                <span>{topic.name}</span>
                {topic.completed && <span className="completed-badge">✓</span>}
              </div>
            ))}
          </div>

          {selectedTopic && (
            <div className="topic-assessment">
              <h3>Assessment for {selectedTopic.name}</h3>
              {selectedTopic.assessment.questions.map(question => (
                <div key={question.id} className="assessment-question">
                  <p>{question.text}</p>
                  {question.options.map((option, index) => (
                    <label key={index}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={index}
                        checked={assessmentAnswers[question.id] === index}
                        onChange={() => handleAnswerSelect(question.id, index)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}
              <button 
                className="btn btn-primary" 
                onClick={submitAssessment}
                disabled={Object.keys(assessmentAnswers).length !== selectedTopic.assessment.questions.length}
              >
                Submit Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
