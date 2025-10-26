import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString } from 'class-validator';
import { FlightLog } from '../../../entities/flight-log.entity';

export class CreateFlightLogDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  missionId: number;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsDateString()
  timestamp: string;
}

export class UpdateFlightLogDto extends PartialType(CreateFlightLogDto) { }

export class FlightLogResponseDto {
  @ApiProperty({ description: 'Flight log ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  missionId: number;

  @ApiProperty({ description: 'Event type' })
  eventType: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;

  constructor(flightLog: FlightLog) {
    this.id = flightLog.id;
    this.missionId = flightLog.missionId;
    this.eventType = flightLog.eventType;
    this.description = flightLog.description;
    this.timestamp = flightLog.timestamp;
  }
}
