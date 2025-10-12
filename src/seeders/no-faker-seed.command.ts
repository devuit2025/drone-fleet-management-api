import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NoFakerSeeder } from './no-faker.seeder';

async function bootstrap() {
  console.log('🚀 Starting database seeding without faker...');
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const noFakerSeeder = appContext.get(NoFakerSeeder);

  await noFakerSeeder.seed();
  await appContext.close();
}

bootstrap();
