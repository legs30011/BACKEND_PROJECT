const { check, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validateProduct = [
  check('name').notEmpty().withMessage('Name is required'),
  check('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  check('description').notEmpty().withMessage('Description is required'),
  check('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['laptops', 'smartphones', 'tablets', 'accessories', 'other'])
    .withMessage('Invalid category'),
  check('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  check('brand').notEmpty().withMessage('Brand is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new ApiError(400, errorMessages.join(', ')));
    }
    next();
  },
];

module.exports = { validateProduct };