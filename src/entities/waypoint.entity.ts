import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MissionDrone } from './mission-drone.entity';

@Entity('waypoint')
export class Waypoint {
    @ApiProperty({ description: 'Waypoint ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Mission Drone ID' })
    @Column({ name: 'mission_drone_id' })
    missionDroneId: number;

    @ManyToOne(() => MissionDrone, missionDrone => missionDrone.waypoints, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'mission_drone_id' })
    missionDrone: MissionDrone;

    @ApiProperty({ description: 'Sequence number' })
    @Column({ name: 'seq_number' })
    seqNumber: number;

    @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
    @Column({ name: 'geo_point', type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
    geoPoint: any;

    @ApiProperty({ description: 'Altitude in meters' })
    @Column({ name: 'altitude_m', type: 'numeric' })
    altitudeM: number;

    @ApiProperty({ description: 'Speed in meters per second' })
    @Column({ name: 'speed_mps', type: 'numeric' })
    speedMps: number;

    @ApiProperty({ description: 'Action to perform at waypoint' })
    @Column()
    action: string;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
