const { BAD_REQUEST } = require("http-status");
const responseSender = require("../utils/responseSender");

class AppError extends Error {
    statusCode;

    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, AppError.prototype);

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorLogger = (error, _req, _res, next) => {
    console.log(`error ${error.stack}`);
    next(error);
};

const errorResponder = (error, _req, res, _next) => {
    const status = error.statusCode || BAD_REQUEST;
    const response = {
        success: false,
        message: error.message,
        data: null,
        status,
    };

    return responseSender(response, res);
};

module.exports = { errorLogger, errorResponder, AppError };
