import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    phoneNumber, 
    bloodGroup, 
    location, 
    city,
    latitude,
    longitude,
    age, 
    lastDonationDate 
  } = req.body;

  try {
    // 1. Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Resolve default coordinates if not provided for city
    let finalLat = latitude;
    let finalLng = longitude;
    if (role === 'donor' && city) {
      const CITY_COORDINATES = {
        'Guntur': { latitude: 16.3067, longitude: 80.4365 },
        'Vijayawada': { latitude: 16.5062, longitude: 80.6480 },
        'Hyderabad': { latitude: 17.3850, longitude: 78.4867 },
        'Chennai': { latitude: 13.0827, longitude: 80.2707 },
        'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
        'Mumbai': { latitude: 19.0760, longitude: 72.8777 }
      };
      if (finalLat === undefined || finalLng === undefined || finalLat === null || finalLng === null) {
        const coords = CITY_COORDINATES[city];
        if (coords) {
          finalLat = coords.latitude;
          finalLng = coords.longitude;
        }
      }
    }

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      bloodGroup,
      location: location || city,
      city,
      latitude: finalLat,
      longitude: finalLng,
      age,
      lastDonationDate: lastDonationDate || null,
    });

    // 4. Return token and user details
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bloodGroup: user.bloodGroup,
        location: user.location,
        city: user.city,
        latitude: user.latitude,
        longitude: user.longitude,
        age: user.age,
        lastDonationDate: user.lastDonationDate,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Return token and user details
    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bloodGroup: user.bloodGroup,
        location: user.location,
        age: user.age,
        lastDonationDate: user.lastDonationDate,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user is populated by protect middleware
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber,
        bloodGroup: req.user.bloodGroup,
        location: req.user.location,
        age: req.user.age,
        lastDonationDate: req.user.lastDonationDate,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

export default router;
