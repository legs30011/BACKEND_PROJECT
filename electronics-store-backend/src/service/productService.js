const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

class ProductService {
  /**
   * Get all products with optional filters
   * @param {Object} filters - Optional filters (category, minPrice, maxPrice)
   * @returns {Promise<Array>} Array of products with their features
   */
  async getAllProducts(filters = {}) {
    try {
      const { category, minPrice, maxPrice, brand } = filters;
      
      const whereClause = {
        ...(category && { category }),
        ...(brand && { brand }),
        ...((minPrice || maxPrice) && {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
          }
        })
      };

      const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw new ApiError(500, 'Failed to retrieve products');
    }
  }

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product object with features
   */
  async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      logger.info(`Retrieved product ${id}`);
      return product;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(`Error fetching product ${id}:`, error);
      throw new ApiError(500, 'Failed to retrieve product');
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data including features array
   * @returns {Promise<Object>} Created product with features
   */
  async createProduct(productData) {
    try {
      const { features = [], ...data } = productData;
      
      const product = await prisma.product.create({
        data: {
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          features: {
            create: features.map(name => ({ name }))
          }
        },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Created product ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw new ApiError(400, 'Failed to create product');
    }
  }

  /**
   * Update existing product
   * @param {number} id - Product ID
   * @param {Object} updateData - Data to update including optional features
   * @returns {Promise<Object>} Updated product with features
   */
  async updateProduct(id, updateData) {
    try {
      const { features, ...data } = updateData;
      
      // First update product basic data
      const updateOperation = {
        where: { id: Number(id) },
        data: {
          ...data,
          ...(data.price && { price: parseFloat(data.price) }),
          ...(data.stock && { stock: parseInt(data.stock) })
        },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      };

      // If features are provided, update them
      if (features) {
        // First delete all existing features
        await prisma.feature.deleteMany({
          where: { productId: Number(id) }
        });
        
        // Then add the new ones
        updateOperation.data.features = {
          create: features.map(name => ({ name }))
        };
      }

      const product = await prisma.product.update(updateOperation);

      logger.info(`Updated product ${id}`);
      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Product not found');
      }
      logger.error(`Error updating product ${id}:`, error);
      throw new ApiError(400, 'Failed to update product');
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Deleted product
   */
  async deleteProduct(id) {
    try {
      // First delete all features to avoid foreign key constraint
      await prisma.feature.deleteMany({
        where: { productId: Number(id) }
      });

      // Then delete the product
      const product = await prisma.product.delete({
        where: { id: Number(id) }
      });

      logger.info(`Deleted product ${id}`);
      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Product not found');
      }
      logger.error(`Error deleting product ${id}:`, error);
      throw new ApiError(500, 'Failed to delete product');
    }
  }

  /**
   * Search products by name or description
   * @param {string} query - Search term
   * @returns {Promise<Array>} Matching products with features
   */
  async searchProducts(query) {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Found ${products.length} products matching "${query}"`);
      return products;
    } catch (error) {
      logger.error(`Error searching products for "${query}":`, error);
      throw new ApiError(500, 'Search failed');
    }
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Products in category with features
   */
  async getProductsByCategory(category) {
    try {
      const products = await prisma.product.findMany({
        where: { category },
        orderBy: { price: 'asc' },
        include: {
          features: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      logger.info(`Found ${products.length} products in category ${category}`);
      return products;
    } catch (error) {
      logger.error(`Error fetching products for category ${category}:`, error);
      throw new ApiError(500, 'Failed to fetch category products');
    }
  }
}

module.exports = new ProductService();