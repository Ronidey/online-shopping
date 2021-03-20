module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.httpStatus = statusCode;
    this.status = 'fail';
    this.isOperational = true;
  }
};
