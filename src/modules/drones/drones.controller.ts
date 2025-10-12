import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DronesService } from './drones.service';
import { DroneStatus } from '../../entities/drone.entity';
import {
  CreateDroneDto,
  UpdateDroneDto,
  DroneResponseDto,
  UpdateStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Drones')
@Controller('api/v1/drones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DronesController {
  constructor(private readonly dronesService: DronesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new drone' })
  @ApiResponse({ status: 201, description: 'Drone created successfully', type: DroneResponseDto })
  @ApiResponse({ status: 409, description: 'Drone already exists' })
  async create(@Body() createDroneDto: CreateDroneDto): Promise<DroneResponseDto> {
    const drone = await this.dronesService.create(createDroneDto);
    return new DroneResponseDto(drone);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drones' })
  @ApiResponse({ status: 200, description: 'Drones retrieved successfully', type: [DroneResponseDto] })
  async findAll(): Promise<DroneResponseDto[]> {
    const drones = await this.dronesService.findAll();
    return drones.map(drone => new DroneResponseDto(drone));
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drones' })
  @ApiResponse({ status: 200, description: 'Available drones retrieved successfully', type: [DroneResponseDto] })
  async findAvailable(): Promise<DroneResponseDto[]> {
    const drones = await this.dronesService.findAvailableDrones();
    return drones.map(drone => new DroneResponseDto(drone));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get drones by status' })
  @ApiResponse({ status: 200, description: 'Drones retrieved successfully', type: [DroneResponseDto] })
  async findByStatus(@Param('status') status: DroneStatus): Promise<DroneResponseDto[]> {
    const drones = await this.dronesService.findByStatus(status);
    return drones.map(drone => new DroneResponseDto(drone));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drone by ID' })
  @ApiResponse({ status: 200, description: 'Drone retrieved successfully', type: DroneResponseDto })
  @ApiResponse({ status: 404, description: 'Drone not found' })
  async findOne(@Param('id') id: number): Promise<DroneResponseDto> {
    const drone = await this.dronesService.findById(id);
    return new DroneResponseDto(drone);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drone' })
  @ApiResponse({ status: 200, description: 'Drone updated successfully', type: DroneResponseDto })
  @ApiResponse({ status: 404, description: 'Drone not found' })
  async update(
    @Param('id') id: number,
    @Body() updateDroneDto: UpdateDroneDto,
  ): Promise<DroneResponseDto> {
    const drone = await this.dronesService.update(id, updateDroneDto);
    return new DroneResponseDto(drone);
  }


  @Patch(':id/status')
  @ApiOperation({ summary: 'Update drone status' })
  @ApiResponse({ status: 200, description: 'Drone status updated successfully' })
  @ApiResponse({ status: 404, description: 'Drone not found' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<void> {
    await this.dronesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drone' })
  @ApiResponse({ status: 200, description: 'Drone deleted successfully' })
  @ApiResponse({ status: 404, description: 'Drone not found' })
  async remove(@Param('id') id: number): Promise<void> {
    await this.dronesService.delete(id);
  }
}
