import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { Waypoint } from './waypoint.entity';
import { Drone } from './drone.entity';
import { Telemetry } from './telemetry.entity';
import { FlightLog } from './flight-log.entity';
import { MissionReport } from './mission-report.entity';
import { Simulation } from './simulation.entity';
import { Pilot } from './pilot.entity';

export enum MissionStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('missions')
export class Mission {
    @ApiProperty({ description: 'Mission ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Pilot ID' })
    @Column({ name: 'pilot_id' })
    pilotId: number;

    @ManyToOne(() => Pilot, pilot => pilot.missions, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'pilot_id' })
    pilot?: Pilot;

    @ApiProperty({ description: 'License ID' })
    @Column({
        name: 'license_id',
        nullable: true,
    })
    licenseId: number | null;

    @ApiProperty({ description: 'Mission name' })
    @Searchable({ operator: 'like' })
    @Column({ name: 'mission_name' })
    missionName: string;

    @ApiProperty({ description: 'Mission status', enum: MissionStatus })
    @Column({
        type: 'enum',
        enum: MissionStatus,
        default: MissionStatus.PLANNED,
    })
    status: MissionStatus;

    @ApiProperty({ description: 'Start time', nullable: true })
    @Column({ name: 'start_time', type: 'timestamp', nullable: true })
    startTime: Date | null;

    @ApiProperty({ description: 'End time', nullable: true })
    @Column({ name: 'end_time', type: 'timestamp', nullable: true })
    endTime: Date | null;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Waypoint, waypoint => waypoint.mission, { createForeignKeyConstraints: false })
    waypoints: Waypoint[];

    @ManyToMany(() => Drone, drone => drone.missions, { createForeignKeyConstraints: false })
    @JoinTable({
        name: 'mission_drones',
        joinColumn: { name: 'mission_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'drone_id', referencedColumnName: 'id' },
    })
    drones: Drone[];

    @OneToMany(() => Telemetry, telemetry => telemetry.mission, { createForeignKeyConstraints: false })
    telemetry: Telemetry[];

    @OneToMany(() => FlightLog, log => log.mission, { createForeignKeyConstraints: false })
    flightLogs: FlightLog[];

    @OneToMany(() => MissionReport, report => report.mission, { createForeignKeyConstraints: false })
    reports: MissionReport[];

    @OneToMany(() => Simulation, simulation => simulation.mission, { createForeignKeyConstraints: false })
    simulations: Simulation[];
}
