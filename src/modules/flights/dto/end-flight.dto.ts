import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EndFlightDto {
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
