import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { PermitStatus, FlightPermit } from '../../../entities/flight-permit.entity';

export class CreateFlightPermitDto {
  @ApiProperty({ description: 'License ID' })
  @IsNumber()
  licenseId: number;

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

export class UpdateFlightPermitDto extends PartialType(CreateFlightPermitDto) { }

export class FlightPermitResponseDto {
  @ApiProperty({ description: 'Flight permit ID' })
  id: number;

  @ApiProperty({ description: 'License ID' })
  licenseId: number;

  @ApiProperty({ description: 'Permit number' })
  permitNumber: string;

  @ApiProperty({ description: 'Permit status', enum: PermitStatus })
  status: PermitStatus;

  @ApiProperty({ description: 'Permitted airspace (PostGIS Polygon SRID=4326)' })
  airspaceArea: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Applicant name' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant address' })
  applicantAddress?: string;

  @ApiProperty({ description: 'Applicant nationality' })
  applicantNationality?: string;

  @ApiProperty({ description: 'Applicant phone' })
  applicantPhone?: string;

  @ApiProperty({ description: 'Flight purpose' })
  flightPurpose?: string;

  @ApiProperty({ description: 'Issued date' })
  issuedDate?: Date;

  @ApiProperty({ description: 'Expiry date' })
  expiryDate?: Date;

  @ApiProperty({ description: 'Takeoff/landing location' })
  takeoffLandingLocation?: string;

  @ApiProperty({ description: 'Attachments' })
  attachments?: any;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(permit: FlightPermit) {
    this.id = permit.id;
    this.licenseId = permit.licenseId;
    this.permitNumber = permit.permitNumber;
    this.status = permit.status;
    this.airspaceArea =
      typeof permit.airspaceArea === 'string'
        ? permit.airspaceArea
        : JSON.stringify(permit.airspaceArea);
    this.description = permit.description;
    this.applicantName = permit.applicantName;
    this.applicantAddress = permit.applicantAddress;
    this.applicantNationality = permit.applicantNationality;
    this.applicantPhone = permit.applicantPhone;
    this.flightPurpose = permit.flightPurpose;
    this.issuedDate = permit.issuedDate;
    this.expiryDate = permit.expiryDate;
    this.takeoffLandingLocation = permit.takeoffLandingLocation;
    this.attachments = permit.attachments;
    this.createdAt = permit.createdAt;
    this.updatedAt = permit.updatedAt;
  }
}



