import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateFlightLogDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  mission_id: number;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  event_type: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsDateString()
  timestamp: string;
}

export class UpdateFlightLogDto {
  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsNumber()
  mission_id?: number;

  @ApiProperty({ description: 'Event type', required: false })
  @IsOptional()
  @IsString()
  event_type?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Timestamp', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class FlightLogResponseDto {
  @ApiProperty({ description: 'Flight log ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  mission_id: number;

  @ApiProperty({ description: 'Event type' })
  event_type: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;
}
