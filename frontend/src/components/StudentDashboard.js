import React, { useState, useEffect } from 'react';

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
    const fetchStudentData = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        const studentData = {
          name: 'John Doe',
          enrolledCourses: ['computer-science']
        };
        setSelectedCourse(studentData.enrolledCourses[0]);
        
        if (studentId) {
          console.log('Student ID:', studentId);
        }
      } catch (error) {
        console.error('Error fetching student data', error);
      }
    };

    fetchStudentData();
  }, []);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setAssessmentAnswers({});
    setAssessmentSubmitted(false);
  };

  const handleAnswerSelect = (questionId, selectedOptionIndex) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionIndex
    }));
  };

  const submitAssessment = () => {
    let correctAnswers = 0;
    const totalQuestions = selectedTopic.assessment.questions.length;

    selectedTopic.assessment.questions.forEach(question => {
      if (assessmentAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const passPercentage = (correctAnswers / totalQuestions) * 100;

    // Use assessmentSubmitted to control submission logic
    if (!assessmentSubmitted) {
      setAssessmentSubmitted(true);
      
      alert(`Assessment Submitted!\nScore: ${correctAnswers}/${totalQuestions} (${passPercentage.toFixed(2)}%)`);
      
      if (passPercentage >= 70) {
        selectedTopic.completed = true;
      }
    }
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
                {assessmentSubmitted ? 'Assessment Completed' : 'Submit Assessment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
