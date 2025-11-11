import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsNumber,
    IsEnum,
    IsArray,
    ValidateNested,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MissionStatus } from '../../../entities/mission.entity';

class CreateMissionWaypointDto {
    @ApiProperty({ description: 'Sequence number' })
    @IsNumber()
    seqNumber: number;

    @ApiProperty({ description: 'Geographic point (PostGIS Point SRID=4326)' })
    @IsString()
    geoPoint: string;

    @ApiProperty({ description: 'Altitude in meters' })
    @IsNumber()
    altitudeM: number;

    @ApiProperty({ description: 'Speed in meters per second' })
    @IsNumber()
    speedMps: number;

    @ApiProperty({ description: 'Action to perform at waypoint' })
    @IsString()
    action: string;
}

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
    @IsEnum(MissionStatus)
    status?: MissionStatus;

    @ApiProperty({ description: 'Start time', required: false })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiProperty({ description: 'End time', required: false })
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @ApiProperty({
        description: 'Waypoints to create together with the mission',
        type: () => [CreateMissionWaypointDto],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMissionWaypointDto)
    waypoints?: CreateMissionWaypointDto[];
}

export { CreateMissionWaypointDto };
