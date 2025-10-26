import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionReportsController } from './mission-reports.controller';
import { MissionReportsService } from './mission-reports.service';
import { MissionReport } from '../../entities/mission-report.entity';
import { Mission } from '../../entities/mission.entity';
import { MissionReportRepository } from '../../repositories/mission-report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MissionReport, Mission])],
  controllers: [MissionReportsController],
  providers: [MissionReportsService, MissionReportRepository],
  exports: [MissionReportsService],
})
export class MissionReportsModule { }

