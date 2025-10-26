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
        this.pilotId = mission.pilotId;
        this.licenseId = mission.licenseId;
        this.missionName = mission.missionName;
        this.status = mission.status;
        this.startTime = mission.startTime;
        this.endTime = mission.endTime;
        this.createdAt = mission.createdAt;
        this.updatedAt = mission.updatedAt;
    }
}
