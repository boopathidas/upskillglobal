const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  mobileNumber: { 
    type: String, 
    required: true 
  },
  specialization: { 
    type: String 
  },
  courses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }],
  registrationDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Trainer', TrainerSchema);
