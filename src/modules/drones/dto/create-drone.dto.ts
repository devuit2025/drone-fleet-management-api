import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { DroneStatus } from '../../../entities/drone.entity';

export class CreateDroneDto {
    @ApiProperty({ description: 'Model ID' })
    @IsNumber()
    modelId: number;

    @ApiProperty({ description: 'Drone serial number' })
    @IsString()
    serialNumber: string;

    @ApiProperty({ description: 'Drone name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Drone status', enum: DroneStatus, required: false })
    @IsOptional()
    @IsEnum(DroneStatus)
    status?: DroneStatus;

    @ApiProperty({ description: 'Firmware version', required: false })
    @IsOptional()
    @IsString()
    firmwareVersion?: string;

    @ApiProperty({ description: 'Battery health percentage', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    batteryHealth?: number;

    @ApiProperty({ description: 'Total flight hours', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalFlightHours?: number;

    @ApiProperty({ description: 'Last maintenance date', required: false })
    @IsOptional()
    lastMaintenance?: Date;
}
