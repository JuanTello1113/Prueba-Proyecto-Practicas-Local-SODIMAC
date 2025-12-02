import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { headersMiddleware } from '../src/common/middleware/headers.function';

describe('Headers Middleware (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Register the middleware manually for testing since main.ts is not executed in e2e tests
        // unless we use the actual bootstrap, but adding it here mimics main.ts behavior
        app.use(headersMiddleware);

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('/ (GET) should return microservice headers', () => {
        return request(app.getHttpServer())
            .get('/') // Assuming root or any 404 is fine, we just check headers
            .expect((res) => {
                expect(res.headers['x-request-id']).toBeDefined();
                expect(res.headers['x-service-name']).toBe('nomina-backend');
                expect(res.headers['x-service-version']).toBe('1.0.0');
                expect(res.headers['x-correlation-id']).toBeDefined();
            });
    });
});
