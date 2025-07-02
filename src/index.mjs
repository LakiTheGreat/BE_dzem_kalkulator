import express, { response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/api/order-types', (req, res) => {
  res.status(200).json({
    orderTypes: ['Delivery', 'Pickup'],
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
