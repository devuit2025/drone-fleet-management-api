import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';

export class CreateFlightDto {
    @ApiProperty({ description: 'Flight name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Flight description', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Planned start time' })
    @IsDateString()
    plannedStartTime: string;

    @ApiProperty({ description: 'Planned duration in minutes' })
    @IsInt()
    @Min(1)
    plannedDuration: number;

    @ApiProperty({ description: 'Starting latitude' })
    @IsNumber()
    startLatitude: number;

    @ApiProperty({ description: 'Starting longitude' })
    @IsNumber()
    startLongitude: number;

    @ApiProperty({ description: 'Starting altitude' })
    @IsNumber()
    startAltitude: number;

    @ApiProperty({ description: 'Pilot ID' })
    @IsUUID()
    pilotId: string;

    @ApiProperty({ description: 'Drone ID' })
    @IsUUID()
    droneId: string;

    @ApiProperty({ description: 'Weather conditions', required: false })
    @IsOptional()
    @IsString()
    weatherConditions?: string;

    @ApiProperty({ description: 'Flight notes', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
