import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';

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

    @Searchable({ operator: 'like' })
    @ApiProperty({ description: 'Drone name' })
    @Column()
    name: string;

    @Searchable({ operator: 'like' })
    @ApiProperty({ description: 'Drone model' })
    @Column()
    model: string;

    @ApiProperty({ description: 'Drone serial number' })
    @Column({ name: 'serial_number', unique: true })
    serialNumber: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    @Column({
        type: 'enum',
        enum: DroneStatus,
        default: DroneStatus.AVAILABLE,
    })
    status: DroneStatus;

    @ApiProperty({ description: 'Maximum payload weight' })
    @Column({ name: 'max_payload', type: 'numeric' })
    maxPayload: number;

    @ApiProperty({ description: 'Battery capacity' })
    @Column({ name: 'battery_capacity', type: 'numeric' })
    batteryCapacity: number;

    @ApiProperty({ description: 'Last maintenance date' })
    @Column({ name: 'last_maintenance', type: 'date', nullable: true })
    lastMaintenance: Date;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
