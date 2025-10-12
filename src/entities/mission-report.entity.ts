import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('mission_reports')
export class MissionReport {
  @ApiProperty({ description: 'Mission report ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  @Column()
  mission_id: number;

  @ApiProperty({ description: 'Flight time in seconds' })
  @Column()
  flight_time_sec: number;

  @ApiProperty({ description: 'Distance in meters' })
  @Column({ type: 'numeric' })
  distance_m: number;

  @ApiProperty({ description: 'Average speed in meters per second' })
  @Column({ type: 'numeric' })
  avg_speed_mps: number;

  @ApiProperty({ description: 'Battery consumed percentage' })
  @Column({ type: 'numeric' })
  battery_consumed_pct: number;

  @ApiProperty({ description: 'Incident count' })
  @Column()
  incident_count: number;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  created_at: Date;
}
