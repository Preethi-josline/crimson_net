import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import stockRoutes from './routes/stock.js';
import donorRoutes from './routes/donors.js';
import BloodStock from './models/BloodStock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_demand_db';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/donors', donorRoutes);

// Simple API Root
app.get("/", (req, res) => {
  res.send("CrimsonNet Backend Running");
});

// Basic Route for testing connection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Blood Demand Forecasting API is healthy' });
});

// Database Seed function for default stock levels
const seedBloodStock = async () => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of bloodGroups) {
      const exists = await BloodStock.findOne({ bloodGroup: group });
      if (!exists) {
        await BloodStock.create({ bloodGroup: group, units: 10 });
        console.log(`Seeded initial stock for blood group: ${group}`);
      }
    }
  } catch (err) {
    console.error('Error seeding blood stock:', err);
  }
};

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedBloodStock();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('Attempting to start server offline (without MongoDB)...');
    
    // Start server anyway for front-end development, but log warnings on DB requests
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (offline mode - MongoDB disconnected)`);
    });
  });
