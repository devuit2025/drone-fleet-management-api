import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('flight_logs')
export class FlightLog {
  @ApiProperty({ description: 'Flight log ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mission ID' })
  @Column()
  mission_id: number;

  @ApiProperty({ description: 'Event type' })
  @Column()
  event_type: string;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Timestamp' })
  @Column()
  timestamp: Date;
}
