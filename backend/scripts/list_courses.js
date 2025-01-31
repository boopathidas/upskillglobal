const mongoose = require('mongoose');
const Course = require('../models/Course');

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://boopathid:Boopathi2001@boopathi.rjk1x.mongodb.net/upskill_global?authSource=admin&retryWrites=true&w=majority';

async function listCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Fetch all courses
    const courses = await Course.find({});
    
    console.log('Available Courses:');
    courses.forEach(course => {
      console.log(`- Name: ${course.name}, ID: ${course._id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

listCourses();
