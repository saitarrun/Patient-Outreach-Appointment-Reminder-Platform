import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import { randomUUID } from 'crypto';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const traceId = req.headers['x-trace-id'] || randomUUID();

    // Attach traceId to request for use in controllers
    (req as any).traceId = traceId;

    // Log Request
    logger.info('Incoming Request', {
        traceId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    const start = Date.now();

    // Log Response (on finish)
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request Completed', {
            traceId,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
