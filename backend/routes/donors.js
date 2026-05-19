import express from 'express';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// @desc    Search donors by blood group and location
// @route   GET /api/donors/search
// @access  Private (Blood Bank & Admin only)
router.get('/search', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  const { bloodGroup, location } = req.query;

  try {
    const query = { role: 'donor' };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (location) {
      // Case-insensitive regex match
      query.location = { $regex: new RegExp(location.trim(), 'i') };
    }

    const donors = await User.find(query).select('-password').sort({ name: 1 });

    return res.json({
      success: true,
      donors,
    });
  } catch (error) {
    console.error('Search donors error:', error);
    return res.status(500).json({ success: false, message: 'Server error searching donors' });
  }
});

export default router;
