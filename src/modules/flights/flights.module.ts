import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { Mission } from '../../entities/mission.entity';
import { Waypoint } from '../../entities/waypoint.entity';
import { FlightRepository } from '../../repositories/flight.repository';
import { FlightPathRepository } from '../../repositories/flight-path.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Mission, Waypoint])],
    controllers: [FlightsController],
    providers: [FlightsService, FlightRepository, FlightPathRepository],
    exports: [FlightsService, FlightRepository, FlightPathRepository],
})
export class FlightsModule {}
