import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneSensorsController } from './drone-sensors.controller';
import { DroneSensorsService } from './drone-sensors.service';
import { DroneSensor } from '../../entities/drone-sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DroneSensor])],
  controllers: [DroneSensorsController],
  providers: [DroneSensorsService],
  exports: [DroneSensorsService],
})
export class DroneSensorsModule { }

