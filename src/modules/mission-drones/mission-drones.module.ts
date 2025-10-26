import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionDronesController } from './mission-drones.controller';
import { MissionDronesService } from './mission-drones.service';
import { MissionDrone } from '../../entities/mission-drone.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MissionDrone, Mission, Drone])],
  controllers: [MissionDronesController],
  providers: [MissionDronesService],
  exports: [MissionDronesService],
})
export class MissionDronesModule { }

