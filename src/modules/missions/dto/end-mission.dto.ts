import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EndMissionDto {
    @ApiProperty({ description: 'Ending latitude' })
    @IsNumber()
    endLatitude: number;

    @ApiProperty({ description: 'Ending longitude' })
    @IsNumber()
    endLongitude: number;

    @ApiProperty({ description: 'Ending altitude' })
    @IsNumber()
    endAltitude: number;

    @ApiProperty({ description: 'Flight notes', required: false })
    notes?: string;
}
