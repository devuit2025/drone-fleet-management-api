import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateLocationDto {
    @ApiProperty({ description: 'Latitude' })
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Longitude' })
    @IsNumber()
    longitude: number;

    @ApiProperty({ description: 'Altitude in meters' })
    @IsNumber()
    altitude: number;

    @ApiProperty({ description: 'Speed in km/h' })
    @IsNumber()
    speed: number;
}
