import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Waypoint } from '../../../entities/waypoint.entity';
import { formatPointGeometry } from '../../../utils/geometry';

export class CreateWaypointDto {
  @ApiProperty({ description: 'Mission Drone ID' })
  @IsNumber()
  missionDroneId: number;

  @ApiProperty({ description: 'Sequence number' })
  @IsNumber()
  seqNumber: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
  @IsString()
  geoPoint: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @IsNumber()
  altitudeM: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @IsNumber()
  speedMps: number;

  @ApiProperty({ description: 'Action to perform at waypoint' })
  @IsString()
  action: string;
}

export class UpdateWaypointDto extends PartialType(CreateWaypointDto) { }

export class WaypointResponseDto {
  @ApiProperty({ description: 'Waypoint ID' })
  id: number;

  @ApiProperty({ description: 'Mission Drone ID' })
  missionDroneId: number;

  @ApiProperty({ description: 'Sequence number' })
  seqNumber: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
  geoPoint: string;

  @ApiProperty({ description: 'Altitude in meters' })
  altitudeM: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  speedMps: number;

  @ApiProperty({ description: 'Action to perform at waypoint' })
  action: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  constructor(waypoint: Waypoint) {
    this.id = waypoint.id;
    this.missionDroneId = waypoint.missionDroneId;
    this.seqNumber = waypoint.seqNumber;
    this.geoPoint = formatPointGeometry(waypoint.geoPoint);
    this.altitudeM = waypoint.altitudeM;
    this.speedMps = waypoint.speedMps;
    this.action = waypoint.action;
    this.createdAt = waypoint.createdAt;
  }
}
