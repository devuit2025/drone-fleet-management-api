import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { Telemetry } from '../../entities/telemetry.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Telemetry, Mission, Drone])],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule { }

