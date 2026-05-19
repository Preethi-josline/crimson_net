import express from 'express';
import BloodStock from '../models/BloodStock.js';
import DonationLog from '../models/DonationLog.js';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all blood stock levels
// @route   GET /api/stock
// @access  Private (All authenticated roles)
router.get('/', protect, async (req, res) => {
  try {
    const stock = await BloodStock.find();
    return res.json({ success: true, stock });
  } catch (error) {
    console.error('Get stock error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving stock levels' });
  }
});

// @desc    Get low stock levels with matching available donors
// @route   GET /api/stock/low-stock-recovery
// @access  Private (Blood Bank & Admin)
router.get('/low-stock-recovery', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  const userCity = req.query.city || 'Hyderabad';

  try {
    // 1. Fetch all stock
    const stock = await BloodStock.find();
    
    // 2. Identify low stock (units < 5)
    const lowStockItems = stock.filter(item => item.units < 5);

    // 3. For each low stock item, fetch matching eligible donors (filtered by blood group, sorted by distance from userCity)
    const recoveryData = await Promise.all(lowStockItems.map(async (item) => {
      // Find matching donors
      const donors = await User.find({
        role: 'donor',
        bloodGroup: item.bloodGroup
      }).select('-password');

      const CITY_COORDINATES = {
        'Guntur': { latitude: 16.3067, longitude: 80.4365 },
        'Vijayawada': { latitude: 16.5062, longitude: 80.6480 },
        'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
        'Chennai': { latitude: 13.0827, longitude: 80.2707 },
        'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
        'Mumbai': { latitude: 19.0760, longitude: 72.8777 }
      };

      const getDistance = (lat1, lon1, lat2, lon2) => {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined || lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
          return null;
        }
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Resolve blood bank's coords
      let hLat = null, hLng = null;
      const bankCityMatch = Object.keys(CITY_COORDINATES).find(
        c => c.toLowerCase() === userCity.trim().toLowerCase()
      );
      if (bankCityMatch) {
        hLat = CITY_COORDINATES[bankCityMatch].latitude;
        hLng = CITY_COORDINATES[bankCityMatch].longitude;
      }

      // Map donors with distances
      const donorsWithDistance = donors.map(donor => {
        let dLat = donor.latitude;
        let dLng = donor.longitude;
        if (dLat === undefined || dLng === undefined || dLat === null || dLng === null) {
          const match = Object.keys(CITY_COORDINATES).find(
            c => c.toLowerCase() === (donor.city || donor.location || '').trim().toLowerCase()
          );
          if (match) {
            dLat = CITY_COORDINATES[match].latitude;
            dLng = CITY_COORDINATES[match].longitude;
          }
        }

        const dist = getDistance(hLat, hLng, dLat, dLng);
        return {
          ...donor.toObject(),
          distance: dist !== null ? parseFloat(dist.toFixed(1)) : 9999
        };
      });

      // Sort by nearest distance first
      donorsWithDistance.sort((a, b) => a.distance - b.distance);

      return {
        bloodGroup: item.bloodGroup,
        units: item.units,
        isCritical: item.units < 3,
        donors: donorsWithDistance
      };
    }));

    return res.json({
      success: true,
      recoveryData
    });

  } catch (error) {
    console.error('Low stock recovery data error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving low stock recovery info' });
  }
});

// @desc    Update stock level of a specific blood group manually
// @route   PUT /api/stock
// @access  Private (Blood Bank & Admin only)
router.put('/', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  const { bloodGroup, units } = req.body;

  try {
    if (!bloodGroup || units === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide bloodGroup and units' });
    }

    const stock = await BloodStock.findOne({ bloodGroup });
    if (!stock) {
      return res.status(404).json({ success: false, message: `Blood group ${bloodGroup} not found` });
    }

    stock.units = parseInt(units);
    stock.lastUpdated = Date.now();
    await stock.save();

    return res.json({ success: true, stock });
  } catch (error) {
    console.error('Update stock error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating stock levels' });
  }
});

// @desc    Log a donation and increment blood group stock by 1
// @route   POST /api/stock/donate
// @access  Private (Blood Bank & Admin only)
router.post('/donate', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  const { donorName, bloodGroup, hospitalRequestLinked } = req.body;

  try {
    if (!donorName || !bloodGroup) {
      return res.status(400).json({ success: false, message: 'Please provide donorName and bloodGroup' });
    }

    // Find and update Blood Stock level (+1 bag)
    const stock = await BloodStock.findOne({ bloodGroup });
    if (!stock) {
      return res.status(404).json({ success: false, message: `Blood group ${bloodGroup} not found` });
    }

    stock.units += 1;
    stock.lastUpdated = Date.now();
    await stock.save();

    // Create Donation Log
    const newLog = new DonationLog({
      donorName,
      bloodGroup,
      hospitalRequestLinked: hospitalRequestLinked || null,
      date: new Date()
    });
    await newLog.save();

    console.log(`[Donation API] Donation received from ${donorName} for group ${bloodGroup}. Stock increased to ${stock.units}`);

    return res.status(201).json({
      success: true,
      message: 'Blood stock updated successfully',
      stock,
      log: newLog
    });

  } catch (error) {
    console.error('[Donation API] Error recording donation:', error);
    return res.status(500).json({ success: false, message: `Error recording donation: ${error.message}` });
  }
});

// @desc    Get all donation history logs
// @route   GET /api/stock/donations
// @access  Private (Blood Bank & Admin only)
router.get('/donations', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  try {
    const donations = await DonationLog.find()
      .populate('hospitalRequestLinked', 'hospitalName location units status')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('[Donation API] Error fetching logs:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving donation logs' });
  }
});

export default router;
