import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import lookupRouter from './src/routes/lookups.mjs';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(lookupRouter);

app.use(
  cors({
    origin: '*',
  })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
