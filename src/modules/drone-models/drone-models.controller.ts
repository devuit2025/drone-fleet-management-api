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
import { DroneModelsService } from './drone-models.service';
import { CreateDroneModelDto, UpdateDroneModelDto, DroneModelResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Drone Models')
@Controller('api/v1/drone-models')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DroneModelsController extends BaseController {
  constructor(private readonly droneModelsService: DroneModelsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new drone model' })
  @ApiResponse({
    status: 201,
    description: 'Drone model created successfully',
    type: DroneModelResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Model with this name already exists' })
  async create(@Body() createDroneModelDto: CreateDroneModelDto): Promise<DroneModelResponseDto> {
    const droneModel = await this.droneModelsService.create(createDroneModelDto);
    return new DroneModelResponseDto(droneModel);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drone models' })
  @ApiResponse({
    status: 200,
    description: 'List of all drone models',
    type: [DroneModelResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<DroneModelResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.droneModelsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((model) => new DroneModelResponseDto(model as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drone model by ID' })
  @ApiResponse({
    status: 200,
    description: 'Drone model retrieved successfully',
    type: DroneModelResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone model not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DroneModelResponseDto> {
    const droneModel = await this.droneModelsService.findById(id);
    return new DroneModelResponseDto(droneModel);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drone model' })
  @ApiResponse({
    status: 200,
    description: 'Drone model updated successfully',
    type: DroneModelResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone model not found' })
  @ApiResponse({ status: 409, description: 'Model with this name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDroneModelDto: UpdateDroneModelDto,
  ): Promise<DroneModelResponseDto> {
    const droneModel = await this.droneModelsService.update(id, updateDroneModelDto);
    return new DroneModelResponseDto(droneModel);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drone model' })
  @ApiResponse({ status: 200, description: 'Drone model deleted successfully' })
  @ApiResponse({ status: 404, description: 'Drone model not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.droneModelsService.delete(id);
  }
}

