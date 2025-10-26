import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Mission } from './mission.entity';
import { Drone } from './drone.entity';

@Entity('telemetry')
export class Telemetry {
    @ApiProperty({ description: 'Telemetry ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Drone ID' })
    @Column({ name: 'drone_id' })
    droneId: number;

    @ManyToOne(() => Drone, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'drone_id' })
    drone: Drone;

    @ApiProperty({ description: 'Mission ID' })
    @Column({ name: 'mission_id' })
    missionId: number;

    @ManyToOne(() => Mission, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'mission_id' })
    mission: Mission;

    @ApiProperty({ description: 'Timestamp' })
    @Column()
    timestamp: Date;

    @ApiProperty({ description: 'Location (PostGIS Point SRID=4326)' })
    @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
    location: string;

    @ApiProperty({ description: 'Altitude in meters' })
    @Column({ name: 'altitude_m', type: 'numeric' })
    altitudeM: number;

    @ApiProperty({ description: 'Speed in meters per second' })
    @Column({ name: 'speed_mps', type: 'numeric' })
    speedMps: number;

    @ApiProperty({ description: 'Battery percentage' })
    @Column({ name: 'battery_pct', type: 'numeric' })
    batteryPct: number;

    @ApiProperty({ description: 'Status' })
    @Column()
    status: string;

    @ApiProperty({ description: 'Payload weight' })
    @Column({ name: 'payload_weight', type: 'numeric' })
    payloadWeight: number;
}
