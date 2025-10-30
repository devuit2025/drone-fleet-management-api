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
import { DroneCategoriesService } from './drone-categories.service';
import { CreateDroneCategoryDto, UpdateDroneCategoryDto, DroneCategoryResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Drone Categories')
@Controller('api/v1/drone-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DroneCategoriesController extends BaseController {
  constructor(private readonly droneCategoriesService: DroneCategoriesService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new drone category' })
  @ApiResponse({
    status: 201,
    description: 'Drone category created successfully',
    type: DroneCategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  async create(@Body() createDroneCategoryDto: CreateDroneCategoryDto): Promise<DroneCategoryResponseDto> {
    const droneCategory = await this.droneCategoriesService.create(createDroneCategoryDto);
    return new DroneCategoryResponseDto(droneCategory);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drone categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all drone categories',
    type: [DroneCategoryResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<DroneCategoryResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.droneCategoriesService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((category) => new DroneCategoryResponseDto(category as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drone category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Drone category retrieved successfully',
    type: DroneCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DroneCategoryResponseDto> {
    const droneCategory = await this.droneCategoriesService.findById(id);
    return new DroneCategoryResponseDto(droneCategory);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drone category' })
  @ApiResponse({
    status: 200,
    description: 'Drone category updated successfully',
    type: DroneCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone category not found' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDroneCategoryDto: UpdateDroneCategoryDto,
  ): Promise<DroneCategoryResponseDto> {
    const droneCategory = await this.droneCategoriesService.update(id, updateDroneCategoryDto);
    return new DroneCategoryResponseDto(droneCategory);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drone category' })
  @ApiResponse({ status: 200, description: 'Drone category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Drone category not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.droneCategoriesService.delete(id);
  }
}

