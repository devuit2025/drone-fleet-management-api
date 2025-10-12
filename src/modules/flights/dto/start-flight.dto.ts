import { ApiProperty } from '@nestjs/swagger';

export class StartFlightDto {
    @ApiProperty({ description: 'Actual start time', required: false })
    actualStartTime?: Date;
}
