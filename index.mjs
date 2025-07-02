import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fruits } from './src/mock.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://dzem-kalkulator.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    // credentials: true, // Only include this if you use cookies or Authorization headers
  })
);
const PORT = process.env.PORT || 5000;

app.get('/api/order-types', (req, res) => {
  res.status(200).json(fruits);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
