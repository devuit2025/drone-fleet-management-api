import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Waypoint } from './waypoint.entity';

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

    @ApiProperty({ description: 'License ID' })
    @Column({
        name: 'license_id',
        nullable: true,
    })
    licenseId: number | null;

    @ApiProperty({ description: 'Mission name' })
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
}
