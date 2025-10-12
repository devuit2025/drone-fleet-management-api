import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum LicenseType {
  COMMERCIAL = 'commercial',
  RECREATIONAL = 'recreational',
}

export enum QualificationLevel {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('licenses')
export class License {
  @ApiProperty({ description: 'License ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Pilot ID' })
  @Column()
  pilot_id: number;

  @ApiProperty({ description: 'License number' })
  @Column({ unique: true })
  license_number: string;

  @ApiProperty({ description: 'License type', enum: LicenseType })
  @Column({
    type: 'enum',
    enum: LicenseType,
  })
  license_type: LicenseType;

  @ApiProperty({ description: 'Qualification level', enum: QualificationLevel })
  @Column({
    type: 'enum',
    enum: QualificationLevel,
  })
  qualification_level: QualificationLevel;

  @ApiProperty({ description: 'Issuing authority' })
  @Column()
  issuing_authority: string;

  @ApiProperty({ description: 'Issued date' })
  @Column({ type: 'date' })
  issued_date: Date;

  @ApiProperty({ description: 'Expiry date' })
  @Column({ type: 'date' })
  expiry_date: Date;

  @ApiProperty({ description: 'License is active' })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updated_at: Date;
}
