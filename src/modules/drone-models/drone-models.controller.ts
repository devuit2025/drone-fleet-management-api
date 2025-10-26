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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DroneModelsService } from './drone-models.service';
import { CreateDroneModelDto, UpdateDroneModelDto, DroneModelResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Drone Models')
@Controller('api/v1/drone-models')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DroneModelsController {
  constructor(private readonly droneModelsService: DroneModelsService) { }

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
  async findAll(): Promise<DroneModelResponseDto[]> {
    const droneModels = await this.droneModelsService.findAll();
    return droneModels.map((model) => new DroneModelResponseDto(model));
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

