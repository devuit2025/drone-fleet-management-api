import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DronesController } from './drones.controller';
import { DronesService } from './drones.service';
import { Drone } from '../../entities/drone.entity';
import { DroneRepository } from '../../repositories/drone.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Drone])],
  controllers: [DronesController],
  providers: [DronesService, DroneRepository],
  exports: [DronesService, DroneRepository],
})
export class DronesModule { }
