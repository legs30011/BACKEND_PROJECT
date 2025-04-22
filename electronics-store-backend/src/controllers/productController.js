const productService = require('./../service/productService');
const ApiResponse = require('../utils/apiResponse');

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const products = await productService.getAllProducts(req.query);
      ApiResponse.success(res, 'Products retrieved successfully', products);
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      ApiResponse.success(res, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      ApiResponse.created(res, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      ApiResponse.success(res, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      ApiResponse.success(res, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();