import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
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
        .setTitle('Drone Fleet Management API')
        .setDescription('API for managing drone fleet with real-time tracking')
        .setVersion('1.0')
        .addBearerAuth()
        .addServer('http://localhost:3000/api/v1', 'Development server')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(3000);
    console.log('🚀 Application is running on: http://localhost:3000');
    console.log('📚 Swagger documentation: http://localhost:3000/api-docs');
}
bootstrap();
