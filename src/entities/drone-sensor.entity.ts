import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { Drone } from './drone.entity';

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAULTY = 'faulty',
}

@Entity('drone_sensors')
export class DroneSensor {
  @ApiProperty({ description: 'Drone Sensor ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Drone ID', type: Number })
  @Column({ name: 'drone_id' })
  droneId: number;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Sensor type' })
  @Column()
  type: string;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Sensor model', nullable: true })
  @Column({ nullable: true })
  model: string | null;

  @ApiProperty({ description: 'Resolution', nullable: true })
  @Column({ nullable: true })
  resolution: string | null;

  @ApiProperty({ description: 'Field of view', nullable: true })
  @Column({ name: 'field_of_view', type: 'numeric', nullable: true })
  fieldOfView: number | null;

  @ApiProperty({ description: 'Sensor status', enum: SensorStatus })
  @Column({
    type: 'enum',
    enum: SensorStatus,
    default: SensorStatus.ACTIVE,
  })
  status: SensorStatus;

  @ManyToOne(() => Drone, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'drone_id' })
  drone: Drone;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

