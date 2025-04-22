const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Electronics Store API',
      version: '1.0.0',
      description: 'API for managing electronics store products',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'description', 'category', 'stock', 'brand'],
          properties: {
            name: {
              type: 'string',
              example: 'MacBook Pro',
            },
            price: {
              type: 'number',
              example: 1999.99,
            },
            description: {
              type: 'string',
              example: 'Apple laptop with M1 chip',
            },
            category: {
              type: 'string',
              enum: ['laptops', 'smartphones', 'tablets', 'accessories', 'other'],
              example: 'laptops',
            },
            stock: {
              type: 'integer',
              example: 100,
            },
            brand: {
              type: 'string',
              example: 'Apple',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/macbook.jpg',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};