import { ApiProperty } from '@nestjs/swagger';

export class StartMissionDto {
    @ApiProperty({ description: 'Actual start time', required: false })
    actualStartTime?: Date;
}
