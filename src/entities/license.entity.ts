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
import { Pilot } from './pilot.entity';

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
    @Column({ name: 'pilot_id' })
    pilotId: number;

    @ManyToOne(() => Pilot, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'pilot_id' })
    pilot: Pilot;

    @ApiProperty({ description: 'License number' })
    @Column({ name: 'license_number', unique: true })
    licenseNumber: string;

    @ApiProperty({ description: 'License type', enum: LicenseType })
    @Column({
        name: 'license_type',
        type: 'enum',
        enum: LicenseType,
    })
    licenseType: LicenseType;

    @ApiProperty({ description: 'Qualification level', enum: QualificationLevel })
    @Column({
        name: 'qualification_level',
        type: 'enum',
        enum: QualificationLevel,
    })
    qualificationLevel: QualificationLevel;

    @ApiProperty({ description: 'Issuing authority' })
    @Column({ name: 'issuing_authority' })
    issuingAuthority: string;

    @ApiProperty({ description: 'Issued date' })
    @Column({ name: 'issued_date', type: 'date' })
    issuedDate: Date;

    @ApiProperty({ description: 'Expiry date' })
    @Column({ name: 'expiry_date', type: 'date' })
    expiryDate: Date;

    @ApiProperty({ description: 'License is active' })
    @Column({ default: true })
    active: boolean;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
