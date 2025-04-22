const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { 
  stream: { 
    write: (message) => logger.http(message.trim()) 
  }
}));

// Conditional Swagger setup
try {
  const YAML = require('yamljs');
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  logger.info('Swagger UI available at /api-docs');
} catch (error) {
  logger.warn('Swagger documentation not loaded:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    database: 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/products', productRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;