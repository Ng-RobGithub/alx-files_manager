import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import router from './routes/index.js';
import helmet from 'helmet'; // For security headers
import cors from 'cors'; // For handling CORS

config();

const app = express();
const port = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(bodyParser.json());

// Routes
app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
