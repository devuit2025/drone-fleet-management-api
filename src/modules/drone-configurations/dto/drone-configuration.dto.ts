import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateDroneConfigurationDto {
  @ApiProperty({ description: 'Drone ID' })
  @IsNumber()
  drone_id: number;

  @ApiProperty({ description: 'Firmware version' })
  @IsString()
  firmware_version: string;

  @ApiProperty({ description: 'Flight modes', type: [String] })
  @IsArray()
  @IsString({ each: true })
  flight_modes: string[];

  @ApiProperty({ description: 'Sensor types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  sensor_types: string[];
}

export class UpdateDroneConfigurationDto {
  @ApiProperty({ description: 'Drone ID', required: false })
  @IsOptional()
  @IsNumber()
  drone_id?: number;

  @ApiProperty({ description: 'Firmware version', required: false })
  @IsOptional()
  @IsString()
  firmware_version?: string;

  @ApiProperty({ description: 'Flight modes', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  flight_modes?: string[];

  @ApiProperty({ description: 'Sensor types', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sensor_types?: string[];
}

export class DroneConfigurationResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  drone_id: number;

  @ApiProperty({ description: 'Firmware version' })
  firmware_version: string;

  @ApiProperty({ description: 'Flight modes', type: [String] })
  flight_modes: string[];

  @ApiProperty({ description: 'Sensor types', type: [String] })
  sensor_types: string[];

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;
}
