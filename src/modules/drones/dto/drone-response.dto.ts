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
    serial_number: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    status: DroneStatus;

    @ApiProperty({ description: 'Maximum payload weight' })
    max_payload: number;

    @ApiProperty({ description: 'Battery capacity' })
    battery_capacity: number;

    @ApiProperty({ description: 'Last maintenance date' })
    last_maintenance: Date;

    @ApiProperty({ description: 'Creation date' })
    created_at: Date;

    @ApiProperty({ description: 'Last update date' })
    updated_at: Date;

    constructor(drone: Drone) {
        this.id = drone.id;
        this.name = drone.name;
        this.model = drone.model;
        this.serial_number = drone.serial_number;
        this.status = drone.status;
        this.max_payload = drone.max_payload;
        this.battery_capacity = drone.battery_capacity;
        this.last_maintenance = drone.last_maintenance;
        this.created_at = drone.created_at;
        this.updated_at = drone.updated_at;
    }
}
