import { Controller, Get, Post, Body, UseGuards, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pilot, PilotStatus } from '../../entities/pilot.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePilotDto, PilotResponseDto } from './dto';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';
import { PilotsService } from './pilots.service';

@ApiTags('Pilots')
@Controller('api/v1/pilots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PilotsController extends BaseController {
  constructor(private readonly pilotsService: PilotsService) { super(); }

  @Get()
  @ApiOperation({ summary: 'Get all pilots' })
  @ApiResponse({ status: 200, description: 'List of all pilots', type: [PilotResponseDto] })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<PilotResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.pilotsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((pilot) => new PilotResponseDto(pilot as any));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pilot' })
  @ApiResponse({ status: 201, description: 'Pilot created successfully', type: PilotResponseDto })
  async create(@Body() createPilotDto: CreatePilotDto): Promise<PilotResponseDto> {
    const pilot = await this.pilotsService.create(createPilotDto);
    return new PilotResponseDto(pilot as any);
  }
}
