import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateSimulationDto {
  @ApiProperty({ description: 'Pilot ID' })
  @IsNumber()
  pilot_id: number;

  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  mission_id: number;

  @ApiProperty({ description: 'Simulation start time' })
  @IsDateString()
  sim_start_time: string;

  @ApiProperty({ description: 'Simulation end time' })
  @IsDateString()
  sim_end_time: string;

  @ApiProperty({ description: 'Simulation parameters' })
  @IsObject()
  parameters: object;
}

export class UpdateSimulationDto {
  @ApiProperty({ description: 'Pilot ID', required: false })
  @IsOptional()
  @IsNumber()
  pilot_id?: number;

  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsNumber()
  mission_id?: number;

  @ApiProperty({ description: 'Simulation start time', required: false })
  @IsOptional()
  @IsDateString()
  sim_start_time?: string;

  @ApiProperty({ description: 'Simulation end time', required: false })
  @IsOptional()
  @IsDateString()
  sim_end_time?: string;

  @ApiProperty({ description: 'Simulation parameters', required: false })
  @IsOptional()
  @IsObject()
  parameters?: object;
}

export class SimulationResponseDto {
  @ApiProperty({ description: 'Simulation ID' })
  id: number;

  @ApiProperty({ description: 'Pilot ID' })
  pilot_id: number;

  @ApiProperty({ description: 'Mission ID' })
  mission_id: number;

  @ApiProperty({ description: 'Simulation start time' })
  sim_start_time: Date;

  @ApiProperty({ description: 'Simulation end time' })
  sim_end_time: Date;

  @ApiProperty({ description: 'Simulation parameters' })
  parameters: object;
}
