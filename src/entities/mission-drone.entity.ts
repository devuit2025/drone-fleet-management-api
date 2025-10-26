import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Mission } from './mission.entity';
import { Drone } from './drone.entity';

@Entity('mission_drones')
export class MissionDrone {
  @ApiProperty({ description: 'Record ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  @Column({ name: 'mission_id' })
  missionId: number;

  @ManyToOne(() => Mission, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @ApiProperty({ description: 'Drone ID' })
  @Column({ name: 'drone_id' })
  droneId: number;

  @ManyToOne(() => Drone, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'drone_id' })
  drone: Drone;

  @ApiProperty({ description: 'Assigned at timestamp' })
  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}

