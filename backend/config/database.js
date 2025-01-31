const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('Detailed MongoDB Connection Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    process.exit(1);
  }
};

module.exports = connectDB;
