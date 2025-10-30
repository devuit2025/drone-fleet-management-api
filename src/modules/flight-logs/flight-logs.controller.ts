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
import { FlightLogsService } from './flight-logs.service';
import { CreateFlightLogDto, UpdateFlightLogDto, FlightLogResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Flight Logs')
@Controller('api/v1/flight-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlightLogsController extends BaseController {
  constructor(private readonly flightLogsService: FlightLogsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new flight log' })
  @ApiResponse({
    status: 201,
    description: 'Flight log created successfully',
    type: FlightLogResponseDto,
  })
  async create(@Body() createFlightLogDto: CreateFlightLogDto): Promise<FlightLogResponseDto> {
    const flightLog = await this.flightLogsService.create(createFlightLogDto);
    return new FlightLogResponseDto(flightLog);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flight logs' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiResponse({
    status: 200,
    description: 'Flight logs retrieved successfully',
    type: [FlightLogResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<FlightLogResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.flightLogsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((log) => new FlightLogResponseDto(log as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Flight log retrieved successfully',
    type: FlightLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flight log not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FlightLogResponseDto> {
    const flightLog = await this.flightLogsService.findById(id);
    return new FlightLogResponseDto(flightLog);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight log' })
  @ApiResponse({
    status: 200,
    description: 'Flight log updated successfully',
    type: FlightLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flight log not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlightLogDto: UpdateFlightLogDto,
  ): Promise<FlightLogResponseDto> {
    const flightLog = await this.flightLogsService.update(id, updateFlightLogDto as any);
    return new FlightLogResponseDto(flightLog);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete flight log' })
  @ApiResponse({ status: 200, description: 'Flight log deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight log not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.flightLogsService.delete(id);
  }
}

