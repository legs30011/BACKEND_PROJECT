require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Database connection test
const testDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection established');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown handler
const handleShutdown = async () => {
  logger.info('🛑 Starting graceful shutdown...');
  
  try {
    await prisma.$disconnect();
    logger.info('✅ Prisma connection closed');
    
    server.close(() => {
      logger.info('🔴 Server stopped');
      process.exit(0);
    });

    // Force close if hanging
    setTimeout(() => {
      logger.warn('⚠️ Forcing shutdown...');
      process.exit(1);
    }, 5000);
  } catch (error) {
    logger.error('❌ Shutdown error:', error);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logger.error('Exiting due to database connection failure');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  });

  // Handle shutdown signals
  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
    handleShutdown();
  });
};

startServer();