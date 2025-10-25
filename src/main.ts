import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Get environment variables
    const port = process.env.PORT || 3000;
    const nodeEnv = process.env.NODE_ENV || 'development';
    const corsOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:5500'];

    // Enable CORS
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Global API prefix removed - using controller-level prefixes instead

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle(process.env.SWAGGER_TITLE || 'Drone Fleet Management API')
        .setDescription(process.env.SWAGGER_DESCRIPTION || 'API for managing drone fleet with real-time tracking')
        .setVersion(process.env.SWAGGER_VERSION || '1.0')
        .addBearerAuth()
        .addServer(`http://localhost:${port}`, 'Development server')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
    console.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
