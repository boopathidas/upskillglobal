const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long']
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [4, 'Username must be at least 4 characters long']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  mobileNumber: { 
    type: String, 
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    default: null
  },
  qualification: { 
    type: String,
    trim: true
  },
  gender: { 
    type: String, 
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: '{VALUE} is not a valid gender'
    },
    default: 'Other'
  },
  address: {
    street: { 
      type: String, 
      trim: true 
    },
    city: { 
      type: String, 
      trim: true 
    },
    state: { 
      type: String, 
      trim: true 
    },
    country: { 
      type: String, 
      trim: true 
    },
    postalCode: { 
      type: String, 
      trim: true 
    }
  },
  dateOfBirth: { 
    type: Date,
    validate: {
      validator: function(v) {
        // Ensure date of birth is not in the future
        return v ? v <= new Date() : true;
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  emergencyContact: {
    name: { 
      type: String, 
      trim: true 
    },
    phone: { 
      type: String, 
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    }
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Pending' 
  },
  enrollmentDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
  strict: true       // Only allow fields defined in the schema
});

// Pre-save hook for additional validation or processing
StudentSchema.pre('save', function(next) {
  // Ensure username is lowercase and trimmed
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  
  // Ensure email is lowercase and trimmed
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  next();
});

module.exports = mongoose.model('Student', StudentSchema);
