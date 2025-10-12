import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum DroneStatus {
    AVAILABLE = 'available',
    IN_MISSION = 'in_mission',
    MAINTENANCE = 'maintenance',
}

@Entity('drones')
export class Drone {
    @ApiProperty({ description: 'Drone ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Drone name' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Drone model' })
    @Column()
    model: string;

    @ApiProperty({ description: 'Drone serial number' })
    @Column({ unique: true })
    serial_number: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    @Column({
        type: 'enum',
        enum: DroneStatus,
        default: DroneStatus.AVAILABLE,
    })
    status: DroneStatus;

    @ApiProperty({ description: 'Maximum payload weight' })
    @Column({ type: 'numeric' })
    max_payload: number;

    @ApiProperty({ description: 'Battery capacity' })
    @Column({ type: 'numeric' })
    battery_capacity: number;

    @ApiProperty({ description: 'Last maintenance date' })
    @Column({ type: 'date', nullable: true })
    last_maintenance: Date;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    created_at: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updated_at: Date;
}
