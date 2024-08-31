const { NOT_FOUND } = require("http-status");
const { AppError, errorResponder } = require("./errorHandler.middleware");

const invalidPathHandler = (req, res, next) => {
    const appError = new AppError(NOT_FOUND, "Requested resource not found on this server");

    errorResponder(appError, req, res, next);
};

module.exports = invalidPathHandler;
