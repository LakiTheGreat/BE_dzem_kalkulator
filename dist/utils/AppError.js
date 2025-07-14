export default class AppError extends Error {
    status;
    customStatusCode;
    isOperational;
    constructor(message, status, customStatusCode) {
        super(message);
        this.status = status;
        this.customStatusCode = customStatusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map