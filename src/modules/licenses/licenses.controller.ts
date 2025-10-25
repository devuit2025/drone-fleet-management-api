import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../../entities/license.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLicenseDto, LicenseResponseDto } from './dto';

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
  @ApiResponse({ status: 200, description: 'List of all licenses', type: [LicenseResponseDto] })
  async findAll(): Promise<License[]> {
    return await this.licenseRepository.find();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new license' })
  @ApiResponse({ status: 201, description: 'License created successfully', type: LicenseResponseDto })
  async create(@Body() createLicenseDto: CreateLicenseDto): Promise<License> {
    const license = this.licenseRepository.create({
      pilot_id: createLicenseDto.pilotId,
      license_number: createLicenseDto.licenseNumber,
      license_type: createLicenseDto.licenseType,
      qualification_level: createLicenseDto.qualificationLevel,
      issuing_authority: createLicenseDto.issuingAuthority,
      issued_date: new Date(createLicenseDto.issuedDate),
      expiry_date: new Date(createLicenseDto.expiryDate),
      active: createLicenseDto.active !== undefined ? createLicenseDto.active : true,
    });
    return await this.licenseRepository.save(license);
  }
}
