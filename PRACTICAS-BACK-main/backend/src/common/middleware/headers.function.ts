import { Request, Response, NextFunction } from 'express';
import * as uuid from 'uuid';

export function headersMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuid.v4();
    (req as any).headers['x-request-id'] = requestId;

    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Service-Name', 'nomina-backend');
    res.setHeader('X-Service-Version', '1.0.0');

    const correlationId = req.headers['x-correlation-id'] || requestId;
    res.setHeader('X-Correlation-ID', correlationId);

    next();
}
