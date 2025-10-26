import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Mission } from './mission.entity';

@Entity('flight_logs')
export class FlightLog {
    @ApiProperty({ description: 'Flight log ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Mission ID' })
    @Column({ name: 'mission_id' })
    missionId: number;

    @ManyToOne(() => Mission, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'mission_id' })
    mission: Mission;

    @ApiProperty({ description: 'Event type' })
    @Column({ name: 'event_type' })
    eventType: string;

    @ApiProperty({ description: 'Description' })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ description: 'Timestamp' })
    @Column()
    timestamp: Date;
}
