import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('telemetry')
export class Telemetry {
  @ApiProperty({ description: 'Telemetry ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Drone ID' })
  @Column()
  drone_id: number;

  @ApiProperty({ description: 'Mission ID' })
  @Column()
  mission_id: number;

  @ApiProperty({ description: 'Timestamp' })
  @Column()
  timestamp: Date;

  @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  location: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @Column({ type: 'numeric' })
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @Column({ type: 'numeric' })
  speed_mps: number;

  @ApiProperty({ description: 'Battery percentage' })
  @Column({ type: 'numeric' })
  battery_pct: number;

  @ApiProperty({ description: 'Status' })
  @Column()
  status: string;

  @ApiProperty({ description: 'Payload weight' })
  @Column({ type: 'numeric' })
  payload_weight: number;
}
