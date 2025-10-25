import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateTelemetryDto {
  @ApiProperty({ description: 'Drone ID' })
  @IsNumber()
  drone_id: number;

  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  mission_id: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @IsNumber()
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @IsNumber()
  speed_mps: number;

  @ApiProperty({ description: 'Battery percentage' })
  @IsNumber()
  battery_pct: number;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Payload weight' })
  @IsNumber()
  payload_weight: number;
}

export class UpdateTelemetryDto {
  @ApiProperty({ description: 'Drone ID', required: false })
  @IsOptional()
  @IsNumber()
  drone_id?: number;

  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsNumber()
  mission_id?: number;

  @ApiProperty({ description: 'Timestamp', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Altitude in meters', required: false })
  @IsOptional()
  @IsNumber()
  altitude_m?: number;

  @ApiProperty({ description: 'Speed in meters per second', required: false })
  @IsOptional()
  @IsNumber()
  speed_mps?: number;

  @ApiProperty({ description: 'Battery percentage', required: false })
  @IsOptional()
  @IsNumber()
  battery_pct?: number;

  @ApiProperty({ description: 'Status', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Payload weight', required: false })
  @IsOptional()
  @IsNumber()
  payload_weight?: number;
}

export class TelemetryResponseDto {
  @ApiProperty({ description: 'Telemetry ID' })
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  drone_id: number;

  @ApiProperty({ description: 'Mission ID' })
  mission_id: number;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
  location: string;

  @ApiProperty({ description: 'Altitude in meters' })
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  speed_mps: number;

  @ApiProperty({ description: 'Battery percentage' })
  battery_pct: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Payload weight' })
  payload_weight: number;
}
