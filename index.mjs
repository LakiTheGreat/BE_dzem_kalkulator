import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import lookupRouter from './src/routes/lookups.mjs';

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'https://dzem-kalkulator.vercel.app',
];
const PORT = process.env.PORT || 5000;

const app = express();
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

app.use(express.json());
app.use(lookupRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
