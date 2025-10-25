import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License, LicenseType, QualificationLevel } from '../../entities/license.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({ description: 'Pilot ID' })
  @IsNumber()
  pilot_id: number;

  @ApiProperty({ description: 'License number' })
  @IsString()
  license_number: string;

  @ApiProperty({ description: 'License type', enum: LicenseType })
  @IsEnum(LicenseType)
  license_type: LicenseType;

  @ApiProperty({ description: 'Qualification level', enum: QualificationLevel })
  @IsEnum(QualificationLevel)
  qualification_level: QualificationLevel;

  @ApiProperty({ description: 'Issuing authority' })
  @IsString()
  issuing_authority: string;

  @ApiProperty({ description: 'Issued date' })
  @IsDateString()
  issued_date: string;

  @ApiProperty({ description: 'Expiry date' })
  @IsDateString()
  expiry_date: string;

  @ApiProperty({ description: 'License is active', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

@ApiTags('Licenses')
@Controller('api/v1/licenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LicensesController {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all licenses' })
  @ApiResponse({ status: 200, description: 'List of all licenses' })
  async findAll(): Promise<License[]> {
    return await this.licenseRepository.find();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new license' })
  @ApiResponse({ status: 201, description: 'License created successfully' })
  async create(@Body() createLicenseDto: CreateLicenseDto): Promise<License> {
    const license = this.licenseRepository.create({
      ...createLicenseDto,
      issued_date: new Date(createLicenseDto.issued_date),
      expiry_date: new Date(createLicenseDto.expiry_date),
      active: createLicenseDto.active !== undefined ? createLicenseDto.active : true,
    });
    return await this.licenseRepository.save(license);
  }
}
