import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import normalUserRoutes from './routes/normalUser.js';
import storeOwnerRoutes from './routes/storeOwner.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Store Rating Platform API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', storeOwnerRoutes);
app.use('/api', normalUserRoutes);

export default app;
