import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ZoneType } from '../../../entities/no-fly-zone.entity';

export class CreateNoFlyZoneDto {
  @ApiProperty({ description: 'Zone name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Zone type', enum: ZoneType })
  @IsEnum(ZoneType)
  zone_type: ZoneType;

  @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)' })
  @IsString()
  geometry: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;
}

export class UpdateNoFlyZoneDto {
  @ApiProperty({ description: 'Zone name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Zone type', enum: ZoneType, required: false })
  @IsOptional()
  @IsEnum(ZoneType)
  zone_type?: ZoneType;

  @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)', required: false })
  @IsOptional()
  @IsString()
  geometry?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class NoFlyZoneResponseDto {
  @ApiProperty({ description: 'No-fly zone ID' })
  id: number;

  @ApiProperty({ description: 'Zone name' })
  name: string;

  @ApiProperty({ description: 'Zone type', enum: ZoneType })
  zone_type: ZoneType;

  @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)' })
  geometry: string;

  @ApiProperty({ description: 'Description' })
  description: string;
}
