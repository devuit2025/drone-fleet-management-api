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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DroneSensorsService } from './drone-sensors.service';
import { CreateDroneSensorDto, UpdateDroneSensorDto, DroneSensorResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Drone Sensors')
@Controller('api/v1/drone-sensors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DroneSensorsController {
  constructor(private readonly droneSensorsService: DroneSensorsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new drone sensor' })
  @ApiResponse({
    status: 201,
    description: 'Drone sensor created successfully',
    type: DroneSensorResponseDto,
  })
  async create(@Body() createDroneSensorDto: CreateDroneSensorDto): Promise<DroneSensorResponseDto> {
    const droneSensor = await this.droneSensorsService.create(createDroneSensorDto);
    return new DroneSensorResponseDto(droneSensor);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drone sensors or by drone ID' })
  @ApiQuery({ name: 'droneId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of drone sensors',
    type: [DroneSensorResponseDto],
  })
  async findAll(@Query('droneId') droneId?: number): Promise<DroneSensorResponseDto[]> {
    const sensors = droneId
      ? await this.droneSensorsService.findByDroneId(droneId)
      : await this.droneSensorsService.findAll();
    return sensors.map((sensor) => new DroneSensorResponseDto(sensor));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drone sensor by ID' })
  @ApiResponse({
    status: 200,
    description: 'Drone sensor retrieved successfully',
    type: DroneSensorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone sensor not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DroneSensorResponseDto> {
    const droneSensor = await this.droneSensorsService.findById(id);
    return new DroneSensorResponseDto(droneSensor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drone sensor' })
  @ApiResponse({
    status: 200,
    description: 'Drone sensor updated successfully',
    type: DroneSensorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone sensor not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDroneSensorDto: UpdateDroneSensorDto,
  ): Promise<DroneSensorResponseDto> {
    const droneSensor = await this.droneSensorsService.update(id, updateDroneSensorDto);
    return new DroneSensorResponseDto(droneSensor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drone sensor' })
  @ApiResponse({ status: 200, description: 'Drone sensor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Drone sensor not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.droneSensorsService.delete(id);
  }
}

