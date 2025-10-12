import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, Min, Max } from 'class-validator';

export class AddPathPointDto {
  @ApiProperty({ description: 'Latitude' })
  @IsDecimal()
  latitude: number;

  @ApiProperty({ description: 'Longitude' })
  @IsDecimal()
  longitude: number;

  @ApiProperty({ description: 'Altitude in meters' })
  @IsDecimal()
  altitude: number;

  @ApiProperty({ description: 'Speed in km/h' })
  @IsDecimal()
  speed: number;

  @ApiProperty({ description: 'Battery level (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  batteryLevel: number;
}
