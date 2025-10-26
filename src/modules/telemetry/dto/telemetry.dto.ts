import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { Telemetry } from '../../../entities/telemetry.entity';

export class CreateTelemetryDto {
  @ApiProperty({ description: 'Drone ID' })
  @IsNumber()
  droneId: number;

  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  missionId: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @IsNumber()
  altitudeM: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @IsNumber()
  speedMps: number;

  @ApiProperty({ description: 'Battery percentage' })
  @IsNumber()
  batteryPct: number;

  @ApiProperty({ description: 'Status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Payload weight' })
  @IsNumber()
  payloadWeight: number;
}

export class UpdateTelemetryDto extends PartialType(CreateTelemetryDto) { }

export class TelemetryResponseDto {
  @ApiProperty({ description: 'Telemetry ID' })
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  droneId: number;

  @ApiProperty({ description: 'Mission ID' })
  missionId: number;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
  location: string;

  @ApiProperty({ description: 'Altitude in meters' })
  altitudeM: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  speedMps: number;

  @ApiProperty({ description: 'Battery percentage' })
  batteryPct: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Payload weight' })
  payloadWeight: number;

  constructor(telemetry: Telemetry) {
    this.id = telemetry.id;
    this.droneId = telemetry.droneId;
    this.missionId = telemetry.missionId;
    this.timestamp = telemetry.timestamp;
    this.location = telemetry.location;
    this.altitudeM = telemetry.altitudeM;
    this.speedMps = telemetry.speedMps;
    this.batteryPct = telemetry.batteryPct;
    this.status = telemetry.status;
    this.payloadWeight = telemetry.payloadWeight;
  }
}
