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
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto, UpdateTelemetryDto, TelemetryResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Telemetry')
@Controller('api/v1/telemetry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TelemetryController extends BaseController {
  constructor(private readonly telemetryService: TelemetryService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new telemetry record' })
  @ApiResponse({
    status: 201,
    description: 'Telemetry record created successfully',
    type: TelemetryResponseDto,
  })
  async create(@Body() createTelemetryDto: CreateTelemetryDto): Promise<TelemetryResponseDto> {
    const telemetry = await this.telemetryService.create(createTelemetryDto);
    return new TelemetryResponseDto(telemetry);
  }

  @Get()
  @ApiOperation({ summary: 'Get all telemetry records' })
  @ApiQuery({ name: 'droneId', required: false, description: 'Filter by drone ID' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiResponse({
    status: 200,
    description: 'Telemetry records retrieved successfully',
    type: [TelemetryResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<TelemetryResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.telemetryService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((t) => new TelemetryResponseDto(t as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get telemetry record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Telemetry record retrieved successfully',
    type: TelemetryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Telemetry record not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TelemetryResponseDto> {
    const telemetry = await this.telemetryService.findById(id);
    return new TelemetryResponseDto(telemetry);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete telemetry record' })
  @ApiResponse({ status: 200, description: 'Telemetry record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Telemetry record not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.telemetryService.delete(id);
  }
}

