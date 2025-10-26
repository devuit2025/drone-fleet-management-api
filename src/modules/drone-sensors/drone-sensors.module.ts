import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneSensorsController } from './drone-sensors.controller';
import { DroneSensorsService } from './drone-sensors.service';
import { DroneSensor } from '../../entities/drone-sensor.entity';
import { DroneSensorRepository } from '../../repositories/drone-sensor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DroneSensor])],
  controllers: [DroneSensorsController],
  providers: [DroneSensorsService, DroneSensorRepository],
  exports: [DroneSensorsService],
})
export class DroneSensorsModule { }

