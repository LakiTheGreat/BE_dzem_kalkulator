export const errorHandler = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({
        message,
        code: error.status,
        customStatusCode: error.customStatusCode || '',
    });
};
//# sourceMappingURL=errorHandler.js.map