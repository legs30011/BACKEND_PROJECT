const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/Product');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product API', () => {
  beforeEach(async () => {
    await Product.deleteMany();
  });

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      const testProduct = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'laptops',
        stock: 10,
        brand: 'Test Brand',
      });

      const response = await request(app).get('/api/v1/products');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe(testProduct.name);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        price: 200,
        description: 'New Description',
        category: 'smartphones',
        stock: 5,
        brand: 'New Brand',
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProduct.name);

      const productInDb = await Product.findOne({ name: newProduct.name });
      expect(productInDb).not.toBeNull();
    });
  });
});