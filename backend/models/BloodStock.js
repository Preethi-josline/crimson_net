import mongoose from 'mongoose';

const bloodStockSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: [true, 'Please provide the blood group'],
    unique: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  units: {
    type: Number,
    required: [true, 'Please specify the number of units'],
    min: [0, 'Units cannot be negative'],
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const BloodStock = mongoose.model('BloodStock', bloodStockSchema);
export default BloodStock;
