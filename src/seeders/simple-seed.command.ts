import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SimpleSeeder } from './simple.seeder';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(SimpleSeeder);

    try {
        console.log('🚀 Starting simple database seeding...');
        await seeder.seed();
        console.log('✅ Simple database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Simple database seeding failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();
