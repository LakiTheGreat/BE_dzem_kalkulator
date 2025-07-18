import path from 'path';
import winston from 'winston';
const logDir = 'logs';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    })),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ level, message, timestamp }) => {
                return `${timestamp} [${level}]: ${message}`;
            })),
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
        }),
    ],
});
export default logger;
//# sourceMappingURL=logger.js.map