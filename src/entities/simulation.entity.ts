import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('simulations')
export class Simulation {
    @ApiProperty({ description: 'Simulation ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Pilot ID' })
    @Column()
    pilot_id: number;

    @ApiProperty({ description: 'Mission ID' })
    @Column()
    mission_id: number;

    @ApiProperty({ description: 'Simulation start time' })
    @Column()
    sim_start_time: Date;

    @ApiProperty({ description: 'Simulation end time' })
    @Column()
    sim_end_time: Date;

    @ApiProperty({ description: 'Simulation parameters' })
    @Column({ type: 'jsonb' })
    parameters: object;
}
