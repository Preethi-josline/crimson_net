import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hospitalName: {
    type: String,
    required: [true, 'Please provide the hospital name'],
    trim: true,
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please provide the requested blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  units: {
    type: Number,
    required: [true, 'Please specify the number of units required'],
    min: [1, 'Must request at least 1 unit'],
  },
  location: {
    type: String,
    required: [true, 'Please specify the hospital location'],
    trim: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  emergencyLevel: {
    type: String,
    required: [true, 'Please select the emergency level'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid emergency level',
    },
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Fulfilled', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
