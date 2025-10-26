import { ApiProperty } from '@nestjs/swagger';
import { Drone, DroneStatus } from '../../../entities/drone.entity';

export class DroneResponseDto {
    @ApiProperty({ description: 'Drone ID' })
    id: number;

    @ApiProperty({ description: 'Drone name' })
    name: string;

    @ApiProperty({ description: 'Drone model' })
    model: string;

    @ApiProperty({ description: 'Drone serial number' })
    serialNumber: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    status: DroneStatus;

    @ApiProperty({ description: 'Maximum payload weight' })
    maxPayload: number;

    @ApiProperty({ description: 'Battery capacity' })
    batteryCapacity: number;

    @ApiProperty({ description: 'Last maintenance date' })
    lastMaintenance: Date;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    constructor(drone: Drone) {
        this.id = drone.id;
        this.name = drone.name;
        this.model = drone.model;
        this.serialNumber = drone.serialNumber;
        this.status = drone.status;
        this.maxPayload = drone.maxPayload;
        this.batteryCapacity = drone.batteryCapacity;
        this.lastMaintenance = drone.lastMaintenance;
        this.createdAt = drone.createdAt;
        this.updatedAt = drone.updatedAt;
    }
}
