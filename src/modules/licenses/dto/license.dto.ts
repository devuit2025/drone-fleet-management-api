import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { LicenseType, QualificationLevel } from '../../../entities/license.entity';

export class CreateLicenseDto {
  @ApiProperty({ description: 'Pilot ID' })
  @IsNumber()
  pilotId: number;

  @ApiProperty({ description: 'License number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'License type', enum: LicenseType })
  @IsEnum(LicenseType)
  licenseType: LicenseType;

  @ApiProperty({ description: 'Qualification level', enum: QualificationLevel })
  @IsEnum(QualificationLevel)
  qualificationLevel: QualificationLevel;

  @ApiProperty({ description: 'Issuing authority' })
  @IsString()
  issuingAuthority: string;

  @ApiProperty({ description: 'Issued date' })
  @IsDateString()
  issuedDate: string;

  @ApiProperty({ description: 'Expiry date' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'License is active', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateLicenseDto {
  @ApiProperty({ description: 'Pilot ID', required: false })
  @IsOptional()
  @IsNumber()
  pilotId?: number;

  @ApiProperty({ description: 'License number', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ description: 'License type', enum: LicenseType, required: false })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @ApiProperty({ description: 'Qualification level', enum: QualificationLevel, required: false })
  @IsOptional()
  @IsEnum(QualificationLevel)
  qualificationLevel?: QualificationLevel;

  @ApiProperty({ description: 'Issuing authority', required: false })
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiProperty({ description: 'Issued date', required: false })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'License is active', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class LicenseResponseDto {
  @ApiProperty({ description: 'License ID' })
  id: number;

  @ApiProperty({ description: 'Pilot ID' })
  pilotId: number;

  @ApiProperty({ description: 'License number' })
  licenseNumber: string;

  @ApiProperty({ description: 'License type', enum: LicenseType })
  licenseType: LicenseType;

  @ApiProperty({ description: 'Qualification level', enum: QualificationLevel })
  qualificationLevel: QualificationLevel;

  @ApiProperty({ description: 'Issuing authority' })
  issuingAuthority: string;

  @ApiProperty({ description: 'Issued date' })
  issuedDate: Date;

  @ApiProperty({ description: 'Expiry date' })
  expiryDate: Date;

  @ApiProperty({ description: 'License is active' })
  active: boolean;

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  updated_at: Date;
}
