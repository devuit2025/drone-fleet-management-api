import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMissionReportDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  mission_id: number;

  @ApiProperty({ description: 'Flight time in seconds' })
  @IsNumber()
  flight_time_sec: number;

  @ApiProperty({ description: 'Distance in meters' })
  @IsNumber()
  distance_m: number;

  @ApiProperty({ description: 'Average speed in meters per second' })
  @IsNumber()
  avg_speed_mps: number;

  @ApiProperty({ description: 'Battery consumed percentage' })
  @IsNumber()
  battery_consumed_pct: number;

  @ApiProperty({ description: 'Incident count' })
  @IsNumber()
  incident_count: number;
}

export class UpdateMissionReportDto {
  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsNumber()
  mission_id?: number;

  @ApiProperty({ description: 'Flight time in seconds', required: false })
  @IsOptional()
  @IsNumber()
  flight_time_sec?: number;

  @ApiProperty({ description: 'Distance in meters', required: false })
  @IsOptional()
  @IsNumber()
  distance_m?: number;

  @ApiProperty({ description: 'Average speed in meters per second', required: false })
  @IsOptional()
  @IsNumber()
  avg_speed_mps?: number;

  @ApiProperty({ description: 'Battery consumed percentage', required: false })
  @IsOptional()
  @IsNumber()
  battery_consumed_pct?: number;

  @ApiProperty({ description: 'Incident count', required: false })
  @IsOptional()
  @IsNumber()
  incident_count?: number;
}

export class MissionReportResponseDto {
  @ApiProperty({ description: 'Mission report ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  mission_id: number;

  @ApiProperty({ description: 'Flight time in seconds' })
  flight_time_sec: number;

  @ApiProperty({ description: 'Distance in meters' })
  distance_m: number;

  @ApiProperty({ description: 'Average speed in meters per second' })
  avg_speed_mps: number;

  @ApiProperty({ description: 'Battery consumed percentage' })
  battery_consumed_pct: number;

  @ApiProperty({ description: 'Incident count' })
  incident_count: number;

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;
}
