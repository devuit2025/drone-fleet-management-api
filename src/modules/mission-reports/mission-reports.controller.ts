import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionReportsService } from './mission-reports.service';
import { CreateMissionReportDto, UpdateMissionReportDto, MissionReportResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Mission Reports')
@Controller('api/v1/mission-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionReportsController extends BaseController {
  constructor(private readonly missionReportsService: MissionReportsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new mission report' })
  @ApiResponse({
    status: 201,
    description: 'Mission report created successfully',
    type: MissionReportResponseDto,
  })
  async create(@Body() createMissionReportDto: CreateMissionReportDto): Promise<MissionReportResponseDto> {
    const missionReport = await this.missionReportsService.create(createMissionReportDto);
    return new MissionReportResponseDto(missionReport);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mission reports' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiResponse({
    status: 200,
    description: 'Mission reports retrieved successfully',
    type: [MissionReportResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<MissionReportResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.missionReportsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((report) => new MissionReportResponseDto(report as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mission report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Mission report retrieved successfully',
    type: MissionReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mission report not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MissionReportResponseDto> {
    const missionReport = await this.missionReportsService.findById(id);
    return new MissionReportResponseDto(missionReport);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mission report' })
  @ApiResponse({
    status: 200,
    description: 'Mission report updated successfully',
    type: MissionReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mission report not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMissionReportDto: UpdateMissionReportDto,
  ): Promise<MissionReportResponseDto> {
    const missionReport = await this.missionReportsService.update(id, updateMissionReportDto);
    return new MissionReportResponseDto(missionReport);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete mission report' })
  @ApiResponse({ status: 200, description: 'Mission report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Mission report not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.missionReportsService.delete(id);
  }
}

