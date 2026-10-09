import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import storeRoutes from './routes/storeRoutes';
import ratingRoutes from './routes/ratingRoutes';
import ownerRoutes from './routes/ownerRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
