import { ApiProperty } from '@nestjs/swagger';
import { Drone, DroneStatus } from '../../../entities/drone.entity';

export class DroneResponseDto {
    @ApiProperty({ description: 'Drone ID' })
    id: number;

    @ApiProperty({ description: 'Model ID' })
    modelId: number;

    @ApiProperty({ description: 'Drone serial number' })
    serialNumber: string;

    @ApiProperty({ description: 'Drone name' })
    name: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    status: DroneStatus;

    @ApiProperty({ description: 'Firmware version', nullable: true })
    firmwareVersion: string;

    @ApiProperty({ description: 'Battery health percentage', nullable: true })
    batteryHealth: number;

    @ApiProperty({ description: 'Total flight hours' })
    totalFlightHours: number;

    @ApiProperty({ description: 'Last maintenance date', nullable: true })
    lastMaintenance: Date;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    constructor(drone: Drone) {
        this.id = drone.id;
        this.modelId = drone.modelId;
        this.serialNumber = drone.serialNumber;
        this.name = drone.name;
        this.status = drone.status;
        this.firmwareVersion = drone.firmwareVersion;
        this.batteryHealth = drone.batteryHealth;
        this.totalFlightHours = drone.totalFlightHours;
        this.lastMaintenance = drone.lastMaintenance;
        this.createdAt = drone.createdAt;
        this.updatedAt = drone.updatedAt;
    }
}
