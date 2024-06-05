const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const pino = require('./src/services/logging/pinoService.js');
require('cross-fetch/polyfill');

const webServer = require('./api.js');
dotenv.config();

const app = express();
const server = http.createServer(app);
const { port = 3000 } = process.env;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';


app.use(pino);

const allowedOrigins = process.env.CORS_SERVER_ADDRESS.split(',');

// CORS configuration with preflight handling
app.use(cors({
  origin: '*',
  credentials: true, // Allow cookies for authenticated requests (if applicable)
  methods: 'GET, POST, PUT, DELETE, PATCH', // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed request headers
  preflightContinue: false, // Do not continue to the next middleware for OPTIONS requests
  optionsSuccessStatus: 204 // Respond with 204 status for successful OPTIONS requests
}));

app.use(helmet());

// **Uncomment this block for development only (remove in production)**
if (!isProduction) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins during development
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', webServer);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Internal server error',
    error: isProduction ? null : err,
  });
});

server.listen(port, () => {
  pino.logger.info(`Server running on port ${port}.`);
});
