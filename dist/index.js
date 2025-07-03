import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index.js';
dotenv.config();
const allowedOrigins = [
    'http://localhost:3000',
    'https://dzem-kalkulator.vercel.app',
];
const PORT = process.env.PORT || 5000;
const app = express();
//CORS must be before routes!!!
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
// Routes
app.use(router);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
