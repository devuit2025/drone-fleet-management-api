import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('waypoints')
export class Waypoint {
  @ApiProperty({ description: 'Waypoint ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  @Column()
  mission_id: number;

  @ApiProperty({ description: 'Sequence number' })
  @Column()
  seq_number: number;

  @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  geo_point: string;

  @ApiProperty({ description: 'Altitude in meters' })
  @Column({ type: 'numeric' })
  altitude_m: number;

  @ApiProperty({ description: 'Speed in meters per second' })
  @Column({ type: 'numeric' })
  speed_mps: number;

  @ApiProperty({ description: 'Action to perform at waypoint' })
  @Column()
  action: string;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  created_at: Date;
}
