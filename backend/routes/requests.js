import express from 'express';
import mongoose from 'mongoose';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import BloodStock from '../models/BloodStock.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

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
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Helper function to find matching donors for a request
const findMatchingDonors = async (bloodGroup, location, reqLat, reqLng) => {
  if (!bloodGroup) return [];

  let hLat = reqLat;
  let hLng = reqLng;

  if (hLat === undefined || hLng === undefined || hLat === null || hLng === null) {
    const match = Object.keys(CITY_COORDINATES).find(
      (c) => c.toLowerCase() === (location || '').trim().toLowerCase()
    );
    if (match) {
      hLat = CITY_COORDINATES[match].latitude;
      hLng = CITY_COORDINATES[match].longitude;
    }
  }

  // Find all donors matching the bloodGroup
  const allDonors = await User.find({
    role: 'donor',
    bloodGroup: bloodGroup,
  }).select('-password');

  const donorsWithDistance = allDonors.map((donor) => {
    let dLat = donor.latitude;
    let dLng = donor.longitude;
    if (dLat === undefined || dLng === undefined || dLat === null || dLng === null) {
      const match = Object.keys(CITY_COORDINATES).find(
        (c) => c.toLowerCase() === (donor.city || donor.location || '').trim().toLowerCase()
      );
      if (match) {
        dLat = CITY_COORDINATES[match].latitude;
        dLng = CITY_COORDINATES[match].longitude;
      }
    }

    const distance = getDistance(hLat, hLng, dLat, dLng);

    return {
      ...donor.toObject(),
      distance: distance !== null ? parseFloat(distance.toFixed(1)) : 9999,
    };
  });

  // Sort by nearest distance first
  donorsWithDistance.sort((a, b) => a.distance - b.distance);

  // Define "nearby" as same city OR distance <= 100 km
  const nearbyDonors = donorsWithDistance.filter(
    (d) => d.distance <= 100 || (d.city && location && d.city.toLowerCase() === location.trim().toLowerCase())
  );

  if (nearbyDonors.length > 0) {
    return nearbyDonors;
  }

  // If no nearby donors: show donors from nearest cities
  return donorsWithDistance;
};

// @desc    Create a new blood request
// @route   POST /api/requests
// @access  Private (Hospital only)
router.post('/', protect, authorizeRoles('hospital'), async (req, res) => {
  const { bloodGroup, units, location, emergencyLevel, hospitalName, latitude, longitude } = req.body;

  try {
    if (!bloodGroup || !units || !location || !emergencyLevel || !hospitalName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Resolve default coordinates if not passed
    let finalLat = latitude;
    let finalLng = longitude;
    if (finalLat === undefined || finalLng === undefined || finalLat === null || finalLng === null) {
      const match = Object.keys(CITY_COORDINATES).find(
        (c) => c.toLowerCase() === location.trim().toLowerCase()
      );
      if (match) {
        finalLat = CITY_COORDINATES[match].latitude;
        finalLng = CITY_COORDINATES[match].longitude;
      }
    }

    const request = await BloodRequest.create({
      hospital: req.user._id,
      hospitalName,
      bloodGroup,
      units,
      location,
      latitude: finalLat,
      longitude: finalLng,
      emergencyLevel,
    });

    // Populate hospital info
    const populatedRequest = await BloodRequest.findById(request._id)
      .populate('hospital', 'name email');

    // Find matching donors
    const matchingDonors = await findMatchingDonors(bloodGroup, location, finalLat, finalLng);

    return res.status(201).json({
      success: true,
      request: populatedRequest,
      matchingDonors,
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating request' });
  }
});

// @desc    Get requests for the logged-in hospital
// @route   GET /api/requests/hospital
// @access  Private (Hospital only)
router.get('/hospital', protect, authorizeRoles('hospital'), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ hospital: req.user._id })
      .sort({ createdAt: -1 });

    // For each request, find matching donors
    const requestsWithDonors = await Promise.all(
      requests.map(async (request) => {
        const donors = await findMatchingDonors(request.bloodGroup, request.location, request.latitude, request.longitude);
        return {
          ...request.toObject(),
          matchingDonors: donors,
        };
      })
    );

    return res.json({
      success: true,
      requests: requestsWithDonors,
    });
  } catch (error) {
    console.error('Get hospital requests error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving requests' });
  }
});

// @desc    Get all blood requests
// @route   GET /api/requests
// @access  Private (Blood Bank & Admin)
router.get('/', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospital', 'name email')
      .sort({ createdAt: -1 });

    const requestsWithDonors = await Promise.all(
      requests.map(async (request) => {
        const donors = await findMatchingDonors(request.bloodGroup, request.location, request.latitude, request.longitude);
        return {
          ...request.toObject(),
          matchingDonors: donors,
        };
      })
    );

    return res.json({
      success: true,
      requests: requestsWithDonors,
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving requests' });
  }
});

// @desc    Approve a blood request and deduct units from stock
// @route   PUT /api/requests/:id/approve
// @access  Private (Blood Bank & Admin only)
router.put('/:id/approve', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Find stock matching blood group
    const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
    if (!stock || stock.units < request.units) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock in inventory for ${request.bloodGroup}. Available: ${stock ? stock.units : 0} units, Required: ${request.units} units.` 
      });
    }

    // Deduct stock units
    stock.units -= request.units;
    stock.lastUpdated = Date.now();
    await stock.save();

    // Update request status without triggering full schema validation for missing fields
    const updateData = { status: 'Approved' };
    if (!request.hospitalName) {
      updateData.hospitalName = 'Unknown Hospital';
    }

    const populatedRequest = await BloodRequest.findByIdAndUpdate(
      request._id,
      updateData,
      { new: true, runValidators: false }
    ).populate('hospital', 'name email');

    return res.json({
      success: true,
      message: 'Request approved and stock updated successfully',
      request: populatedRequest,
    });
  } catch (error) {
    console.error('Approve request error:', error);
    return res.status(500).json({ success: false, message: `Server error during request approval: ${error.message}` });
  }
});

// @desc    Reject a blood request
// @route   PUT /api/requests/:id/reject
// @access  Private (Blood Bank & Admin only)
router.put('/:id/reject', protect, authorizeRoles('blood bank', 'admin'), async (req, res) => {
  const requestId = req.params.id;
  console.log(`[Reject Request API] Attempting rejection for ID: ${requestId}`);

  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      console.error(`[Reject Request API] Invalid request Object ID passed: ${requestId}`);
      return res.status(400).json({ success: false, message: 'Invalid request ID format' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      console.error(`[Reject Request API] Blood request not found for ID: ${requestId}`);
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      console.warn(`[Reject Request API] Request ID ${requestId} status is not Pending. Status: ${request.status}`);
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    const updateData = { status: 'Rejected' };
    if (!request.hospitalName) {
      updateData.hospitalName = 'Unknown Hospital';
    }

    const populatedRequest = await BloodRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true, runValidators: false }
    ).populate('hospital', 'name email');

    console.log(`[Reject Request API] Successfully rejected request ID: ${requestId}`);

    return res.json({
      success: true,
      message: 'Request rejected successfully',
      request: populatedRequest,
    });
  } catch (error) {
    console.error(`[Reject Request API] Server error rejecting request ID ${requestId}:`, error);
    return res.status(500).json({ success: false, message: `Server error rejecting request: ${error.message}` });
  }
});

export default router;
