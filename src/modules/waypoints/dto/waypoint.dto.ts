import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWaypointDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  mission_id: number;

  @ApiProperty({ description: 'Sequence number' })
  @IsNumber()
  seq_number: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
  @IsString()
  geo_point: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @IsNumber()
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @IsNumber()
  speed_mps: number;

  @ApiProperty({ description: 'Action to perform at waypoint' })
  @IsString()
  action: string;
}

export class UpdateWaypointDto {
  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsNumber()
  mission_id?: number;

  @ApiProperty({ description: 'Sequence number', required: false })
  @IsOptional()
  @IsNumber()
  seq_number?: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)', required: false })
  @IsOptional()
  @IsString()
  geo_point?: string;

  @ApiProperty({ description: 'Altitude in meters', required: false })
  @IsOptional()
  @IsNumber()
  altitude_m?: number;

  @ApiProperty({ description: 'Speed in meters per second', required: false })
  @IsOptional()
  @IsNumber()
  speed_mps?: number;

  @ApiProperty({ description: 'Action to perform at waypoint', required: false })
  @IsOptional()
  @IsString()
  action?: string;
}

export class WaypointResponseDto {
  @ApiProperty({ description: 'Waypoint ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  mission_id: number;

  @ApiProperty({ description: 'Sequence number' })
  seq_number: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
  geo_point: string;

  @ApiProperty({ description: 'Altitude in meters' })
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  speed_mps: number;

  @ApiProperty({ description: 'Action to perform at waypoint' })
  action: string;

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;
}
