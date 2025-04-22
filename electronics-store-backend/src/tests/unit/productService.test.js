const ProductService = require('../../../services/productService');
const Product = require('../../../models/Product');
const ApiError = require('../../../utils/apiError');

jest.mock('../../../models/Product');

describe('ProductService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      const mockProduct = { _id: '1', name: 'Test Product' };
      Product.findById.mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById('1');
      expect(result).toEqual(mockProduct);
      expect(Product.findById).toHaveBeenCalledWith('1');
    });

    it('should throw ApiError when product not found', async () => {
      Product.findById.mockResolvedValue(null);

      await expect(ProductService.getProductById('1')).rejects.toThrow(
        new ApiError(404, 'Product not found')
      );
    });
  });

  describe('createProduct', () => {
    it('should create and return a new product', async () => {
      const productData = { name: 'New Product', price: 100 };
      const mockProduct = { ...productData, _id: '1' };
      const saveMock = jest.fn().mockResolvedValue(mockProduct);
      
      Product.mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await ProductService.createProduct(productData);
      expect(result).toEqual(mockProduct);
      expect(saveMock).toHaveBeenCalled();
    });
  });
});