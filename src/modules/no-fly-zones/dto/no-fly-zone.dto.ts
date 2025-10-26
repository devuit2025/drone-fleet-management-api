import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ZoneType, NoFlyZone } from '../../../entities/no-fly-zone.entity';

export class CreateNoFlyZoneDto {
  @ApiProperty({ description: 'Zone name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Zone type', enum: ZoneType })
  @IsEnum(ZoneType)
  zoneType: ZoneType;

  @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)' })
  @IsString()
  geometry: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;
}

export class UpdateNoFlyZoneDto extends PartialType(CreateNoFlyZoneDto) { }

export class NoFlyZoneResponseDto {
  @ApiProperty({ description: 'No-fly zone ID' })
  id: number;

  @ApiProperty({ description: 'Zone name' })
  name: string;

  @ApiProperty({ description: 'Zone type', enum: ZoneType })
  zoneType: ZoneType;

  @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)' })
  geometry: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  constructor(noFlyZone: NoFlyZone) {
    this.id = noFlyZone.id;
    this.name = noFlyZone.name;
    this.zoneType = noFlyZone.zoneType;
    this.geometry = noFlyZone.geometry;
    this.description = noFlyZone.description;
  }
}
