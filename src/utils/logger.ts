import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.colorize()),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(), // or format.combine(...)
    }),
  ],
});

export default logger;
