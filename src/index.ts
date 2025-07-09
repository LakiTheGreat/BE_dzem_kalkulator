import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import logRequests from './middlwares/logRequets.js';
import router from './routes/index.js';
import logger from './utils/logger.js';
// import checkForToken from './middlwares/auth/protect.js';

dotenv.config(); // loads variables from .env file

const allowedOrigins = [
  'http://localhost:3333',
  'https://dzem-kalkulator.vercel.app',
];

const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fruit API',
      version: '1.0.0',
    },
  },
  apis: ['./src/controllers/*.ts'], // path to files with JSDoc comments
};

const app = express();
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// --------- Middleware ---------
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
    credentials: true,
  })
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses query parameters from string to object
// app.use(checkForToken);
app.use(logRequests);

// ------------------------------

// Routes
app.use('/api', router);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
