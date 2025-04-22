const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query'], // Opcional: muestra logs de queries en desarrollo
});

// Conexión automática y manejo de errores
prisma.$connect()
  .then(() => console.log('🟢 Conectado a SQLite via Prisma'))
  .catch(err => {
    console.error('🔴 Error de conexión:', err);
    process.exit(1);
  });

// Cierre limpio al terminar la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;