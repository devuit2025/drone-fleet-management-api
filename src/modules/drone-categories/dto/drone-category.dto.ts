import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';
import { DroneCategory } from '../../../entities/drone-category.entity';

export class CreateDroneCategoryDto {
  @ApiProperty({ description: 'Category name', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDroneCategoryDto extends PartialType(CreateDroneCategoryDto) { }

export class DroneCategoryResponseDto {
  @ApiProperty({ description: 'Drone Category ID' })
  id: number;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category description', nullable: true })
  description: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(droneCategory: DroneCategory) {
    this.id = droneCategory.id;
    this.name = droneCategory.name;
    this.description = droneCategory.description;
    this.createdAt = droneCategory.createdAt;
    this.updatedAt = droneCategory.updatedAt;
  }
}

