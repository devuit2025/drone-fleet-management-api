import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { License } from '../../entities/license.entity';
import { FlightPermit } from '../../entities/flight-permit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([License, FlightPermit])],
  controllers: [LicensesController],
  providers: [LicensesService],
})
export class LicensesModule { }
