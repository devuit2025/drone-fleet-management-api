import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneModelsController } from './drone-models.controller';
import { DroneModelsService } from './drone-models.service';
import { DroneModel } from '../../entities/drone-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DroneModel])],
  controllers: [DroneModelsController],
  providers: [DroneModelsService],
  exports: [DroneModelsService],
})
export class DroneModelsModule { }

