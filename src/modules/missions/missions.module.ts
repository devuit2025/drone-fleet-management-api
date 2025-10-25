import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from '../../entities/mission.entity';
import { Waypoint } from '../../entities/waypoint.entity';
import { FlightRepository } from '../../repositories/flight.repository';
import { FlightPathRepository } from '../../repositories/flight-path.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Mission, Waypoint])],
    controllers: [MissionsController],
    providers: [MissionsService, FlightRepository, FlightPathRepository],
    exports: [MissionsService, FlightRepository, FlightPathRepository],
})
export class MissionsModule { }
