import mongoose from 'mongoose';

const donationLogSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  hospitalRequestLinked: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DonationLog = mongoose.model('DonationLog', donationLogSchema);
export default DonationLog;
