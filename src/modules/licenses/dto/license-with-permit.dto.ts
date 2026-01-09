import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseType, QualificationLevel } from '../../../entities/license.entity';
import { PermitStatus } from '../../../entities/flight-permit.entity';

class LicenseDataDto {
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

class FlightPermitDataDto {
  @ApiProperty({ description: 'Permit number' })
  @IsString()
  permitNumber: string;

  @ApiProperty({ description: 'Permit status', enum: PermitStatus, required: false })
  @IsOptional()
  @IsEnum(PermitStatus)
  status?: PermitStatus;

  @ApiProperty({ description: 'Permitted airspace (PostGIS Polygon SRID=4326)' })
  @IsString()
  airspaceArea: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Applicant name' })
  @IsString()
  applicantName: string;

  @ApiProperty({ description: 'Applicant address', required: false })
  @IsOptional()
  @IsString()
  applicantAddress?: string;

  @ApiProperty({ description: 'Applicant nationality', required: false })
  @IsOptional()
  @IsString()
  applicantNationality?: string;

  @ApiProperty({ description: 'Applicant phone', required: false })
  @IsOptional()
  @IsString()
  applicantPhone?: string;

  @ApiProperty({ description: 'Flight purpose', required: false })
  @IsOptional()
  @IsString()
  flightPurpose?: string;

  @ApiProperty({ description: 'Issued date', required: false })
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Takeoff/landing location', required: false })
  @IsOptional()
  @IsString()
  takeoffLandingLocation?: string;

  @ApiProperty({ description: 'Attachments (JSON)', required: false })
  @IsOptional()
  attachments?: any;
}

export class CreateLicenseWithPermitDto {
  @ApiProperty({ description: 'License data', type: LicenseDataDto })
  @ValidateNested()
  @Type(() => LicenseDataDto)
  license: LicenseDataDto;

  @ApiProperty({ description: 'Flight permit data', type: FlightPermitDataDto })
  @ValidateNested()
  @Type(() => FlightPermitDataDto)
  flightPermit: FlightPermitDataDto;
}

export class LicenseWithPermitResponseDto {
  @ApiProperty({ description: 'Created license' })
  license: any;

  @ApiProperty({ description: 'Created flight permit' })
  flightPermit: any;
}

