import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, MinLength } from 'class-validator';
import { DroneSensor, SensorStatus } from '../../../entities/drone-sensor.entity';

export class CreateDroneSensorDto {
  @ApiProperty({ description: 'Drone ID' })
  @IsNumber()
  droneId: number;

  @ApiProperty({ description: 'Sensor type', minLength: 2 })
  @IsString()
  @MinLength(2)
  type: string;

  @ApiProperty({ description: 'Sensor model', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Resolution', required: false })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiProperty({ description: 'Field of view', required: false })
  @IsOptional()
  @IsNumber()
  fieldOfView?: number;

  @ApiProperty({ description: 'Sensor status', enum: SensorStatus, required: false })
  @IsOptional()
  @IsEnum(SensorStatus)
  status?: SensorStatus;
}

export class UpdateDroneSensorDto extends PartialType(CreateDroneSensorDto) { }

export class DroneSensorResponseDto {
  @ApiProperty({ description: 'Drone Sensor ID' })
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  droneId: number;

  @ApiProperty({ description: 'Sensor type' })
  type: string;

  @ApiProperty({ description: 'Sensor model', nullable: true })
  model: string;

  @ApiProperty({ description: 'Resolution', nullable: true })
  resolution: string;

  @ApiProperty({ description: 'Field of view', nullable: true })
  fieldOfView: number;

  @ApiProperty({ description: 'Sensor status', enum: SensorStatus })
  status: SensorStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(droneSensor: DroneSensor) {
    this.id = droneSensor.id;
    this.droneId = droneSensor.droneId;
    this.type = droneSensor.type;
    this.model = droneSensor.model;
    this.resolution = droneSensor.resolution;
    this.fieldOfView = Number(droneSensor.fieldOfView);
    this.status = droneSensor.status;
    this.createdAt = droneSensor.createdAt;
    this.updatedAt = droneSensor.updatedAt;
  }
}

