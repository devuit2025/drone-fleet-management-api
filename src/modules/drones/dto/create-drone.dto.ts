import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { DroneStatus } from '../../../entities/drone.entity';

export class CreateDroneDto {
    @ApiProperty({ description: 'Drone name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Drone model' })
    @IsString()
    model: string;

    @ApiProperty({ description: 'Drone serial number' })
    @IsString()
    serial_number: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus, required: false })
    @IsOptional()
    @IsEnum(DroneStatus)
    status?: DroneStatus;

    @ApiProperty({ description: 'Maximum payload weight' })
    @IsNumber()
    @Min(0)
    max_payload: number;

    @ApiProperty({ description: 'Battery capacity' })
    @IsNumber()
    @Min(0)
    battery_capacity: number;

    @ApiProperty({ description: 'Last maintenance date', required: false })
    @IsOptional()
    last_maintenance?: Date;
}
