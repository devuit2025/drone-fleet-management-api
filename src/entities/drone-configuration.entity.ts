import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('drone_configurations')
export class DroneConfiguration {
  @ApiProperty({ description: 'Configuration ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  @Column()
  drone_id: number;

  @ApiProperty({ description: 'Firmware version' })
  @Column()
  firmware_version: string;

  @ApiProperty({ description: 'Flight modes' })
  @Column('text', { array: true })
  flight_modes: string[];

  @ApiProperty({ description: 'Sensor types' })
  @Column('text', { array: true })
  sensor_types: string[];

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  created_at: Date;
}
