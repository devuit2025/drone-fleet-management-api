import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, MinLength } from 'class-validator';
import { DroneModel } from '../../../entities/drone-model.entity';

export class CreateDroneModelDto {
  @ApiProperty({ description: 'Brand ID' })
  @IsNumber()
  brandId: number;

  @ApiProperty({ description: 'Category ID' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'Model name', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Maximum speed (km/h)', required: false })
  @IsOptional()
  @IsNumber()
  maxSpeed?: number;

  @ApiProperty({ description: 'Maximum altitude (m)', required: false })
  @IsOptional()
  @IsNumber()
  maxAltitude?: number;

  @ApiProperty({ description: 'Maximum flight time (minutes)', required: false })
  @IsOptional()
  @IsNumber()
  maxFlightTime?: number;

  @ApiProperty({ description: 'Maximum payload (g)', required: false })
  @IsOptional()
  @IsNumber()
  maxPayload?: number;

  @ApiProperty({ description: 'Battery capacity (mAh)', required: false })
  @IsOptional()
  @IsNumber()
  batteryCapacity?: number;

  @ApiProperty({ description: 'Dimensions', required: false })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
}

export class UpdateDroneModelDto extends PartialType(CreateDroneModelDto) { }

export class DroneModelResponseDto {
  @ApiProperty({ description: 'Drone Model ID' })
  id: number;

  @ApiProperty({ description: 'Brand ID' })
  brandId: number;

  @ApiProperty({ description: 'Category ID' })
  categoryId: number;

  @ApiProperty({ description: 'Model name' })
  name: string;

  @ApiProperty({ description: 'Maximum speed', nullable: true })
  maxSpeed: number;

  @ApiProperty({ description: 'Maximum altitude', nullable: true })
  maxAltitude: number;

  @ApiProperty({ description: 'Maximum flight time', nullable: true })
  maxFlightTime: number;

  @ApiProperty({ description: 'Maximum payload', nullable: true })
  maxPayload: number;

  @ApiProperty({ description: 'Battery capacity', nullable: true })
  batteryCapacity: number;

  @ApiProperty({ description: 'Dimensions', nullable: true })
  dimensions: any;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(droneModel: DroneModel) {
    this.id = droneModel.id;
    this.brandId = droneModel.brandId;
    this.categoryId = droneModel.categoryId;
    this.name = droneModel.name;
    this.maxSpeed = Number(droneModel.maxSpeed);
    this.maxAltitude = Number(droneModel.maxAltitude);
    this.maxFlightTime = Number(droneModel.maxFlightTime);
    this.maxPayload = Number(droneModel.maxPayload);
    this.batteryCapacity = Number(droneModel.batteryCapacity);
    this.dimensions = droneModel.dimensions;
    this.createdAt = droneModel.createdAt;
    this.updatedAt = droneModel.updatedAt;
  }
}

