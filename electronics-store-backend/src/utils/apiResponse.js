class ApiResponse {
    static success(res, message, data = null, statusCode = 200) {
      res.status(statusCode).json({
        success: true,
        message,
        data,
      });
    }
  
    static created(res, message, data) {
      this.success(res, message, data, 201);
    }
  }
  
  module.exports = ApiResponse;