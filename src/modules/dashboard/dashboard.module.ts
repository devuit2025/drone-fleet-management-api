import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Drone } from '../../entities/drone.entity';
import { Mission } from '../../entities/mission.entity';
import { Pilot } from '../../entities/pilot.entity';
import { License } from '../../entities/license.entity';
import { FlightPermit } from '../../entities/flight-permit.entity';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Drone, Mission, Pilot, License, FlightPermit, NoFlyZone]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}

