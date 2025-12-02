//main.ts
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { headersMiddleware } from './common/middleware/headers.function';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sistema Nomina')
    .setDescription('Documentación de Nomina')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('Nomina/docs', app, document);

  app.use(cookieParser()); // Cookies

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, //permite cruze de cookies
  });

  // Security Headers
  app.use(helmet());

  // Functional Middleware for Microservice Headers
  app.use(headersMiddleware);

  // Global BigInt Serialization Interceptor
  app.useGlobalInterceptors(new BigIntInterceptor());

  await app.listen(3000);
}

bootstrap().catch(console.error);
