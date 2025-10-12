import { ApiProperty } from '@nestjs/swagger';
import { Mission, MissionStatus } from '../../../entities/mission.entity';

export class FlightResponseDto {
  @ApiProperty({ description: 'Mission ID' })
  id: number;

  @ApiProperty({ description: 'Pilot ID' })
  pilot_id: number;

  @ApiProperty({ description: 'License ID' })
  license_id: number;

  @ApiProperty({ description: 'Mission name' })
  mission_name: string;

  @ApiProperty({ description: 'Mission status', enum: MissionStatus })
  status: MissionStatus;

  @ApiProperty({ description: 'Start time' })
  start_time: Date;

  @ApiProperty({ description: 'End time' })
  end_time: Date;

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  updated_at: Date;

  constructor(flight: Mission) {
    this.id = flight.id;
    this.pilot_id = flight.pilot_id;
    this.license_id = flight.license_id;
    this.mission_name = flight.mission_name;
    this.status = flight.status;
    this.start_time = flight.start_time;
    this.end_time = flight.end_time;
    this.created_at = flight.created_at;
    this.updated_at = flight.updated_at;
  }
}