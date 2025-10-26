import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { Telemetry } from '../../entities/telemetry.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';
import { TelemetryRepository } from '../../repositories/telemetry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Telemetry, Mission, Drone])],
  controllers: [TelemetryController],
  providers: [TelemetryService, TelemetryRepository],
  exports: [TelemetryService],
})
export class TelemetryModule { }

