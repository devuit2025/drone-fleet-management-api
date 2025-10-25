import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
    @Column()
    pilot_id: number;

    @ApiProperty({ description: 'License ID' })
    @Column({
        nullable: true,
    })
    license_id: number | null;

    @ApiProperty({ description: 'Mission name' })
    @Column()
    mission_name: string;

    @ApiProperty({ description: 'Mission status', enum: MissionStatus })
    @Column({
        type: 'enum',
        enum: MissionStatus,
        default: MissionStatus.PLANNED,
    })
    status: MissionStatus;

    @ApiProperty({ description: 'Start time' })
    @Column({ nullable: true })
    start_time: Date;

    @ApiProperty({ description: 'End time' })
    @Column({ nullable: true })
    end_time: Date;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    created_at: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updated_at: Date;
}
