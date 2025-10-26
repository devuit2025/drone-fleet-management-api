import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { DroneStatus } from '../../../entities/drone.entity';

export class UpdateStatusDto {
    @ApiProperty({ description: 'Drone status', enum: DroneStatus })
    @IsEnum(DroneStatus)
    status: DroneStatus;

    @ApiProperty({ description: 'Battery health', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    battery_health?: number;
}
