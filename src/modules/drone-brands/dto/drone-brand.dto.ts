import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MinLength } from 'class-validator';
import { DroneBrand } from '../../../entities/drone-brand.entity';

export class CreateDroneBrandDto {
  @ApiProperty({ description: 'Brand name', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Country of origin', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
}

export class UpdateDroneBrandDto extends PartialType(CreateDroneBrandDto) { }

export class DroneBrandResponseDto {
  @ApiProperty({ description: 'Drone Brand ID' })
  id: number;

  @ApiProperty({ description: 'Brand name' })
  name: string;

  @ApiProperty({ description: 'Country of origin', nullable: true })
  country: string;

  @ApiProperty({ description: 'Website URL', nullable: true })
  website: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(droneBrand: DroneBrand) {
    this.id = droneBrand.id;
    this.name = droneBrand.name;
    this.country = droneBrand.country;
    this.website = droneBrand.website;
    this.createdAt = droneBrand.createdAt;
    this.updatedAt = droneBrand.updatedAt;
  }
}

