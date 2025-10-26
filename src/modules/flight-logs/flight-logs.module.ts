import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightLogsController } from './flight-logs.controller';
import { FlightLogsService } from './flight-logs.service';
import { FlightLog } from '../../entities/flight-log.entity';
import { Mission } from '../../entities/mission.entity';
import { FlightLogRepository } from '../../repositories/flight-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FlightLog, Mission])],
  controllers: [FlightLogsController],
  providers: [FlightLogsService, FlightLogRepository],
  exports: [FlightLogsService],
})
export class FlightLogsModule { }

