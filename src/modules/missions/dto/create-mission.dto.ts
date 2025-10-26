import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, IsNumber, Min } from 'class-validator';
import { MissionStatus } from '../../../entities/mission.entity';

export class CreateMissionDto {
    @ApiProperty({ description: 'Pilot ID' })
    @IsNumber()
    pilotId: number;

    @ApiProperty({ description: 'License ID', required: false })
    @IsOptional()
    @IsNumber()
    licenseId?: number;

    @ApiProperty({ description: 'Mission name' })
    @IsString()
    missionName: string;

    @ApiProperty({ description: 'Mission status', enum: MissionStatus, required: false })
    @IsOptional()
    status?: MissionStatus;

    @ApiProperty({ description: 'Start time', required: false })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiProperty({ description: 'End time', required: false })
    @IsOptional()
    @IsDateString()
    endTime?: string;
}
