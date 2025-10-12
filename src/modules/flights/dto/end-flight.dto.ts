import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal } from 'class-validator';

export class EndFlightDto {
  @ApiProperty({ description: 'Ending latitude' })
  @IsDecimal()
  endLatitude: number;

  @ApiProperty({ description: 'Ending longitude' })
  @IsDecimal()
  endLongitude: number;

  @ApiProperty({ description: 'Ending altitude' })
  @IsDecimal()
  endAltitude: number;

  @ApiProperty({ description: 'Flight notes', required: false })
  notes?: string;
}
