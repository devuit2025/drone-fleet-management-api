import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightLogsController } from './flight-logs.controller';
import { FlightLogsService } from './flight-logs.service';
import { FlightLog } from '../../entities/flight-log.entity';
import { Mission } from '../../entities/mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlightLog, Mission])],
  controllers: [FlightLogsController],
  providers: [FlightLogsService],
  exports: [FlightLogsService],
})
export class FlightLogsModule { }

