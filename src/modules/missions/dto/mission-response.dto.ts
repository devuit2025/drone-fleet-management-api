import { ApiProperty } from '@nestjs/swagger';
import { Mission, MissionStatus } from '../../../entities/mission.entity';

export class MissionResponseDto {
    @ApiProperty({ description: 'Mission ID' })
    id: number;

    @ApiProperty({ description: 'Pilot ID' })
    pilotId: number;

    @ApiProperty({ description: 'License ID' })
    licenseId: number;

    @ApiProperty({ description: 'Mission name' })
    missionName: string;

    @ApiProperty({ description: 'Mission status', enum: MissionStatus })
    status: MissionStatus;

    @ApiProperty({ description: 'Start time' })
    startTime: Date;

    @ApiProperty({ description: 'End time' })
    endTime: Date;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    constructor(mission: Mission) {
        this.id = mission.id;
        this.pilotId = mission.pilot_id;
        this.licenseId = mission.license_id;
        this.missionName = mission.mission_name;
        this.status = mission.status;
        this.startTime = mission.start_time;
        this.endTime = mission.end_time;
        this.createdAt = mission.created_at;
        this.updatedAt = mission.updated_at;
    }
}
