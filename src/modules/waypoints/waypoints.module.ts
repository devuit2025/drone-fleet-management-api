import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaypointsController } from './waypoints.controller';
import { WaypointsService } from './waypoints.service';
import { Waypoint } from '../../entities/waypoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Waypoint])],
  controllers: [WaypointsController],
  providers: [WaypointsService],
  exports: [WaypointsService],
})
export class WaypointsModule { }

