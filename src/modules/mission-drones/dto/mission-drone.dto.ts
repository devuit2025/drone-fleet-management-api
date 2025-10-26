import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { MissionDrone } from '../../../entities/mission-drone.entity';

export class CreateMissionDroneDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsNumber()
  missionId: number;

  @ApiProperty({ description: 'Drone ID' })
  @IsNumber()
  droneId: number;
}

export class UpdateMissionDroneDto extends PartialType(CreateMissionDroneDto) { }

export class MissionDroneResponseDto {
  @ApiProperty({ description: 'Record ID' })
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  missionId: number;

  @ApiProperty({ description: 'Drone ID' })
  droneId: number;

  @ApiProperty({ description: 'Assigned at timestamp' })
  assignedAt: Date;

  constructor(missionDrone: MissionDrone) {
    this.id = missionDrone.id;
    this.missionId = missionDrone.missionId;
    this.droneId = missionDrone.droneId;
    this.assignedAt = missionDrone.assignedAt;
  }
}

