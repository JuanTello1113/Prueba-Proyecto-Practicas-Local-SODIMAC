import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Global interceptor to serialize BigInt values to strings for JSON responses
 * This prevents JSON serialization errors and keeps controllers clean
 */
@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => this.serializeBigInt(data))
        );
    }

    private serializeBigInt(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'bigint') {
            return obj.toString();
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.serializeBigInt(item));
        }

        if (typeof obj === 'object') {
            const serialized: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    serialized[key] = this.serializeBigInt(obj[key]);
                }
            }
            return serialized;
        }

        return obj;
    }
}
