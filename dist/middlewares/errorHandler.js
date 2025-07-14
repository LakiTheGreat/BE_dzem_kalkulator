export default function errorHandler(error, req, res, next) {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({
        message,
        status: error.status,
        customStatusCode: error.customStatusCode || '',
    });
}
//# sourceMappingURL=errorHandler.js.map