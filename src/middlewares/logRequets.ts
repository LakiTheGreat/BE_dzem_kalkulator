import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export default function logRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  const originalSend = res.send;

  let responseBody: any;

  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const parts = [
      `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
    ];

    if (req.params && Object.keys(req.params).length > 0) {
      parts.push(`params: ${JSON.stringify(req.params)}`);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      parts.push(`body: ${JSON.stringify(req.body)}`);
    }
    if (responseBody) {
      try {
        const parsed =
          typeof responseBody === 'string'
            ? JSON.parse(responseBody)
            : responseBody;
        parts.push(`response: ${JSON.stringify(parsed)}`);
      } catch {
        parts.push(`response: ${responseBody}`);
      }
    }

    logger.info(parts.join(' | '));
  });

  next();
}
