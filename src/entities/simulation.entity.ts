import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pilot } from './pilot.entity';
import { Mission } from './mission.entity';

@Entity('simulations')
export class Simulation {
    @ApiProperty({ description: 'Simulation ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Pilot ID' })
    @Column({ name: 'pilot_id' })
    pilotId: number;

    @ManyToOne(() => Pilot, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'pilot_id' })
    pilot: Pilot;

    @ApiProperty({ description: 'Mission ID' })
    @Column({ name: 'mission_id' })
    missionId: number;

    @ManyToOne(() => Mission, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'mission_id' })
    mission: Mission;

    @ApiProperty({ description: 'Simulation start time' })
    @Column({ name: 'sim_start_time' })
    simStartTime: Date;

    @ApiProperty({ description: 'Simulation end time' })
    @Column({ name: 'sim_end_time' })
    simEndTime: Date;

    @ApiProperty({ description: 'Simulation parameters' })
    @Column({ type: 'jsonb' })
    parameters: object;
}
