import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/api.js';

dotenv.config();

const app = express();

// Enable CORS for production, preview deployments, and custom backend URLs
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Handle routes whether /api prefix is preserved or stripped by Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
