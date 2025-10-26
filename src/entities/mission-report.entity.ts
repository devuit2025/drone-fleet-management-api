import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Mission } from './mission.entity';

@Entity('mission_reports')
export class MissionReport {
    @ApiProperty({ description: 'Mission report ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Mission ID' })
    @Column({ name: 'mission_id' })
    missionId: number;

    @ManyToOne(() => Mission, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'mission_id' })
    mission: Mission;

    @ApiProperty({ description: 'Flight time in seconds' })
    @Column({ name: 'flight_time_sec' })
    flightTimeSec: number;

    @ApiProperty({ description: 'Distance in meters' })
    @Column({ name: 'distance_m', type: 'numeric' })
    distanceM: number;

    @ApiProperty({ description: 'Average speed in meters per second' })
    @Column({ name: 'avg_speed_mps', type: 'numeric' })
    avgSpeedMps: number;

    @ApiProperty({ description: 'Battery consumed percentage' })
    @Column({ name: 'battery_consumed_pct', type: 'numeric' })
    batteryConsumedPct: number;

    @ApiProperty({ description: 'Incident count' })
    @Column({ name: 'incident_count' })
    incidentCount: number;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
