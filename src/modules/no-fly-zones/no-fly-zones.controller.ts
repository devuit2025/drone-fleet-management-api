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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NoFlyZonesService } from './no-fly-zones.service';
import { CreateNoFlyZoneDto, UpdateNoFlyZoneDto, NoFlyZoneResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('No-Fly Zones')
@Controller('api/v1/no-fly-zones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NoFlyZonesController extends BaseController {
  constructor(private readonly noFlyZonesService: NoFlyZonesService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new no-fly zone' })
  @ApiResponse({
    status: 201,
    description: 'No-fly zone created successfully',
    type: NoFlyZoneResponseDto,
  })
  async create(@Body() createNoFlyZoneDto: CreateNoFlyZoneDto): Promise<NoFlyZoneResponseDto> {
    const noFlyZone = await this.noFlyZonesService.create(createNoFlyZoneDto);
    return new NoFlyZoneResponseDto(noFlyZone);
  }

  @Get()
  @ApiOperation({ summary: 'Get all no-fly zones' })
  @ApiResponse({
    status: 200,
    description: 'No-fly zones retrieved successfully',
    type: [NoFlyZoneResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<NoFlyZoneResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.noFlyZonesService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((zone) => new NoFlyZoneResponseDto(zone as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get no-fly zone by ID' })
  @ApiResponse({
    status: 200,
    description: 'No-fly zone retrieved successfully',
    type: NoFlyZoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No-fly zone not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<NoFlyZoneResponseDto> {
    const noFlyZone = await this.noFlyZonesService.findById(id);
    return new NoFlyZoneResponseDto(noFlyZone);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update no-fly zone' })
  @ApiResponse({
    status: 200,
    description: 'No-fly zone updated successfully',
    type: NoFlyZoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No-fly zone not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoFlyZoneDto: UpdateNoFlyZoneDto,
  ): Promise<NoFlyZoneResponseDto> {
    const noFlyZone = await this.noFlyZonesService.update(id, updateNoFlyZoneDto);
    return new NoFlyZoneResponseDto(noFlyZone);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete no-fly zone' })
  @ApiResponse({ status: 200, description: 'No-fly zone deleted successfully' })
  @ApiResponse({ status: 404, description: 'No-fly zone not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.noFlyZonesService.delete(id);
  }
}

