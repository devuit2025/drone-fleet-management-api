import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Pilot, PilotStatus } from '../../../entities/pilot.entity';

export class CreatePilotDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Pilot name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Pilot status', enum: PilotStatus, required: false })
  @IsOptional()
  @IsEnum(PilotStatus)
  status?: PilotStatus;
}

export class UpdatePilotDto {
  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: 'Pilot name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Pilot status', enum: PilotStatus, required: false })
  @IsOptional()
  @IsEnum(PilotStatus)
  status?: PilotStatus;
}

export class PilotResponseDto {
  @ApiProperty({ description: 'Pilot ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Pilot name' })
  name: string;

  @ApiProperty({ description: 'Pilot status', enum: PilotStatus })
  status: PilotStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(pilot: Pilot) {
    this.id = pilot.id;
    this.userId = pilot.userId;
    this.name = pilot.name;
    this.status = pilot.status;
    this.createdAt = pilot.createdAt;
    this.updatedAt = pilot.updatedAt;
  }
}
