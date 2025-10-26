import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsInt } from 'class-validator';
import { MissionReport } from '../../../entities/mission-report.entity';

export class CreateMissionReportDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  missionId: number;

  @ApiProperty({ description: 'Flight time in seconds' })
  @IsInt()
  flightTimeSec: number;

  @ApiProperty({ description: 'Distance in meters' })
  @IsNumber()
  distanceM: number;

  @ApiProperty({ description: 'Average speed in meters per second' })
  @IsNumber()
  avgSpeedMps: number;

  @ApiProperty({ description: 'Battery consumed percentage' })
  @IsNumber()
  batteryConsumedPct: number;

  @ApiProperty({ description: 'Incident count' })
  @IsInt()
  incidentCount: number;
}

export class UpdateMissionReportDto extends PartialType(CreateMissionReportDto) { }

export class MissionReportResponseDto {
  @ApiProperty({ description: 'Mission report ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  missionId: number;

  @ApiProperty({ description: 'Flight time in seconds' })
  flightTimeSec: number;

  @ApiProperty({ description: 'Distance in meters' })
  distanceM: number;

  @ApiProperty({ description: 'Average speed in meters per second' })
  avgSpeedMps: number;

  @ApiProperty({ description: 'Battery consumed percentage' })
  batteryConsumedPct: number;

  @ApiProperty({ description: 'Incident count' })
  incidentCount: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(missionReport: MissionReport) {
    this.id = missionReport.id;
    this.missionId = missionReport.missionId;
    this.flightTimeSec = missionReport.flightTimeSec;
    this.distanceM = missionReport.distanceM;
    this.avgSpeedMps = missionReport.avgSpeedMps;
    this.batteryConsumedPct = missionReport.batteryConsumedPct;
    this.incidentCount = missionReport.incidentCount;
    this.createdAt = missionReport.createdAt;
  }
}
