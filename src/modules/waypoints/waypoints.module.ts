import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaypointsController } from './waypoints.controller';
import { WaypointsService } from './waypoints.service';
import { Waypoint } from '../../entities/waypoint.entity';
import { WaypointRepository } from '../../repositories/waypoint.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Waypoint])],
  controllers: [WaypointsController],
  providers: [WaypointsService, WaypointRepository],
  exports: [WaypointsService],
})
export class WaypointsModule { }

