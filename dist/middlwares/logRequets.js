import logger from '../utils/logger.js';
export default function logRequests(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
}
//# sourceMappingURL=logRequets.js.map