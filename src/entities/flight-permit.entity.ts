import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { License } from './license.entity';

export enum PermitStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('flight_permits')
export class FlightPermit {
  @ApiProperty({ description: 'Flight permit ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'License ID' })
  @Searchable({ operator: '=' })
  @Column({ name: 'license_id' })
  licenseId: number;

  @ManyToOne(() => License, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'license_id' })
  license?: License;

  @ApiProperty({ description: 'Permit number' })
  @Searchable({ operator: 'like' })
  @Column({ name: 'permit_number', unique: true })
  permitNumber: string;

  @ApiProperty({ description: 'Permit status', enum: PermitStatus })
  @Searchable({ operator: '=' })
  @Column({
    type: 'enum',
    enum: PermitStatus,
    default: PermitStatus.PENDING,
  })
  status: PermitStatus;

  @ApiProperty({ description: 'Permitted airspace (PostGIS Polygon SRID=4326)' })
  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  airspaceArea: any;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Applicant name' })
  @Column({ name: 'applicant_name' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant address' })
  @Column({ name: 'applicant_address', type: 'text', nullable: true })
  applicantAddress?: string;

  @ApiProperty({ description: 'Applicant nationality' })
  @Column({ name: 'applicant_nationality', nullable: true })
  applicantNationality?: string;

  @ApiProperty({ description: 'Applicant phone' })
  @Column({ name: 'applicant_phone', nullable: true })
  applicantPhone?: string;

  @ApiProperty({ description: 'Flight purpose' })
  @Column({ name: 'flight_purpose', type: 'text', nullable: true })
  flightPurpose?: string;

  @ApiProperty({ description: 'Issued date' })
  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate?: Date;

  @ApiProperty({ description: 'Expiry date' })
  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @ApiProperty({ description: 'Takeoff/landing location' })
  @Column({ name: 'takeoff_landing_location', type: 'text', nullable: true })
  takeoffLandingLocation?: string;

  @ApiProperty({ description: 'Attachments (JSON)' })
  @Column({ type: 'json', nullable: true })
  attachments?: any;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

