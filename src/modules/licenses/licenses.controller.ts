import { Controller, Get, Post, Body, Patch, Delete, Param, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../../entities/license.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLicenseDto, UpdateLicenseDto, LicenseResponseDto } from './dto';

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
    return await this.licenseRepository.find({
      relations: ['pilot'],
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get license by ID' })
  @ApiResponse({ status: 200, description: 'License found', type: LicenseResponseDto })
  @ApiResponse({ status: 404, description: 'License not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<License> {
    const license = await this.licenseRepository.findOne({
      where: { id },
      relations: ['pilot'],
    });
    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }
    return license;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new license' })
  @ApiResponse({ status: 201, description: 'License created successfully', type: LicenseResponseDto })
  async create(@Body() createLicenseDto: CreateLicenseDto): Promise<License> {
    const license = this.licenseRepository.create({
      pilotId: createLicenseDto.pilotId,
      licenseNumber: createLicenseDto.licenseNumber,
      licenseType: createLicenseDto.licenseType,
      qualificationLevel: createLicenseDto.qualificationLevel,
      issuingAuthority: createLicenseDto.issuingAuthority,
      issuedDate: new Date(createLicenseDto.issuedDate),
      expiryDate: new Date(createLicenseDto.expiryDate),
      active: createLicenseDto.active !== undefined ? createLicenseDto.active : true,
    });
    return await this.licenseRepository.save(license);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a license' })
  @ApiResponse({ status: 200, description: 'License updated successfully', type: LicenseResponseDto })
  @ApiResponse({ status: 404, description: 'License not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLicenseDto: UpdateLicenseDto,
  ): Promise<License> {
    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }

    // Update only provided fields
    if (updateLicenseDto.pilotId !== undefined) {
      license.pilotId = updateLicenseDto.pilotId;
    }
    if (updateLicenseDto.licenseNumber !== undefined) {
      license.licenseNumber = updateLicenseDto.licenseNumber;
    }
    if (updateLicenseDto.licenseType !== undefined) {
      license.licenseType = updateLicenseDto.licenseType;
    }
    if (updateLicenseDto.qualificationLevel !== undefined) {
      license.qualificationLevel = updateLicenseDto.qualificationLevel;
    }
    if (updateLicenseDto.issuingAuthority !== undefined) {
      license.issuingAuthority = updateLicenseDto.issuingAuthority;
    }
    if (updateLicenseDto.issuedDate !== undefined) {
      license.issuedDate = new Date(updateLicenseDto.issuedDate);
    }
    if (updateLicenseDto.expiryDate !== undefined) {
      license.expiryDate = new Date(updateLicenseDto.expiryDate);
    }
    if (updateLicenseDto.active !== undefined) {
      license.active = updateLicenseDto.active;
    }

    return await this.licenseRepository.save(license);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a license' })
  @ApiResponse({ status: 200, description: 'License deleted successfully' })
  @ApiResponse({ status: 404, description: 'License not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) {
      throw new NotFoundException(`License with ID ${id} not found`);
    }
    await this.licenseRepository.remove(license);
  }
}
