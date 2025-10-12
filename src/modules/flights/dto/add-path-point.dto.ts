import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, Min, Max } from 'class-validator';

export class AddPathPointDto {
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

  @ApiProperty({ description: 'Battery level (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  batteryLevel: number;
}
