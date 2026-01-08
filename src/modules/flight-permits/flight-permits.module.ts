import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightPermit } from '../../entities/flight-permit.entity';
import { FlightPermitsController } from './flight-permits.controller';
import { FlightPermitsService } from './flight-permits.service';
import { FlightPermitRepository } from '../../repositories/flight-permit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FlightPermit])],
  controllers: [FlightPermitsController],
  providers: [FlightPermitsService, FlightPermitRepository],
  exports: [FlightPermitsService],
})
export class FlightPermitsModule { }



