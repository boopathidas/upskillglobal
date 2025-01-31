const mongoose = require('mongoose');
const Course = require('../models/Course');

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://boopathid:Boopathi2001@boopathi.rjk1x.mongodb.net/upskill_global?authSource=admin&retryWrites=true&w=majority';

const coursesToSeed = [
  {
    name: 'React Fundamentals',
    syllabus: 'Comprehensive React.js course covering core concepts',
    duration: '3 months',
    amount: 9999
  },
  {
    name: 'Advanced JavaScript',
    syllabus: 'Deep dive into advanced JavaScript techniques',
    duration: '2 months',
    amount: 7999
  },
  {
    name: 'Full Stack Web Development',
    syllabus: 'Complete web development course with MERN stack',
    duration: '6 months',
    amount: 24999
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Remove existing courses
    await Course.deleteMany({});
    console.log('Existing courses cleared');

    // Insert new courses
    const insertedCourses = await Course.insertMany(coursesToSeed);
    console.log('Courses seeded successfully:', 
      insertedCourses.map(course => course.name)
    );
  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

seedCourses();
