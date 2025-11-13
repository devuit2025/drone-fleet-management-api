import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { DroneModel } from './drone-model.entity';
import { MissionDrone } from './mission-drone.entity';
import { DroneSensor } from './drone-sensor.entity';
import { Telemetry } from './telemetry.entity';

export enum DroneStatus {
    AVAILABLE = 'available',
    IN_MISSION = 'in_mission',
    FLYING = 'flying',
    HOVERING = 'hovering',
    LANDING = 'landing',
    MAINTENANCE = 'maintenance',
    DECOMMISSIONED = 'decommissioned',
}

@Entity('drones')
export class Drone {
    @ApiProperty({ description: 'Drone ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Model ID', type: Number, nullable: true })
    @Column({ name: 'model_id', nullable: true })
    modelId: number | null;

    @ApiProperty({ description: 'Drone serial number' })
    @Searchable({ operator: 'like' })
    @Column({ name: 'serial_number', unique: true })
    serialNumber: string;

    @Searchable({ operator: 'like' })
    @ApiProperty({ description: 'Drone name' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    @Searchable()
    @Column({
        type: 'enum',
        enum: DroneStatus,
        default: DroneStatus.AVAILABLE,
    })
    status: DroneStatus;

    @ApiProperty({ description: 'Firmware version', nullable: true })
    @Column({ name: 'firmware_version', nullable: true })
    firmwareVersion: string | null;

    @ApiProperty({ description: 'Battery health percentage', nullable: true })
    @Column({ name: 'battery_health', type: 'numeric', nullable: true })
    batteryHealth: number | null;

    @ApiProperty({ description: 'Total flight hours' })
    @Column({ name: 'total_flight_hours', type: 'numeric', default: 0 })
    totalFlightHours: number;

    @ApiProperty({ description: 'Last maintenance date', nullable: true })
    @Column({ name: 'last_maintenance', type: 'date', nullable: true })
    lastMaintenance: Date | null;

    @ManyToOne(() => DroneModel, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'model_id' })
    model: DroneModel;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => MissionDrone, missionDrone => missionDrone.drone, { createForeignKeyConstraints: false })
    missionDrones: MissionDrone[];

    @OneToMany(() => DroneSensor, sensor => sensor.drone, { createForeignKeyConstraints: false })
    sensors: DroneSensor[];

    @OneToMany(() => Telemetry, telemetry => telemetry.drone, { createForeignKeyConstraints: false })
    telemetry: Telemetry[];
}
