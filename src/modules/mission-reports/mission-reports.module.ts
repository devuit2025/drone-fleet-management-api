import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionReportsController } from './mission-reports.controller';
import { MissionReportsService } from './mission-reports.service';
import { MissionReport } from '../../entities/mission-report.entity';
import { Mission } from '../../entities/mission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MissionReport, Mission])],
  controllers: [MissionReportsController],
  providers: [MissionReportsService],
  exports: [MissionReportsService],
})
export class MissionReportsModule { }

