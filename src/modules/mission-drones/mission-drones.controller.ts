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
import { MissionDronesService } from './mission-drones.service';
import { CreateMissionDroneDto, UpdateMissionDroneDto, MissionDroneResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Mission Drones')
@Controller('api/v1/mission-drones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionDronesController {
  constructor(private readonly missionDronesService: MissionDronesService) { }

  @Post()
  @ApiOperation({ summary: 'Assign drone to mission' })
  @ApiResponse({
    status: 201,
    description: 'Drone assigned to mission successfully',
    type: MissionDroneResponseDto,
  })
  async create(@Body() createMissionDroneDto: CreateMissionDroneDto): Promise<MissionDroneResponseDto> {
    const missionDrone = await this.missionDronesService.create(createMissionDroneDto);
    return new MissionDroneResponseDto(missionDrone);
  }

  @Get()
  @ApiOperation({ summary: 'Get all mission-drone assignments' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiQuery({ name: 'droneId', required: false, description: 'Filter by drone ID' })
  @ApiResponse({
    status: 200,
    description: 'Mission-drone assignments retrieved successfully',
    type: [MissionDroneResponseDto],
  })
  async findAll(
    @Query('missionId') missionId?: string,
    @Query('droneId') droneId?: string,
  ): Promise<MissionDroneResponseDto[]> {
    let missionDrones;

    if (missionId) {
      missionDrones = await this.missionDronesService.findByMission(parseInt(missionId, 10));
    } else if (droneId) {
      missionDrones = await this.missionDronesService.findByDrone(parseInt(droneId, 10));
    } else {
      missionDrones = await this.missionDronesService.findAll();
    }

    return missionDrones.map((md) => new MissionDroneResponseDto(md));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mission-drone assignment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Mission-drone assignment retrieved successfully',
    type: MissionDroneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mission-drone assignment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MissionDroneResponseDto> {
    const missionDrone = await this.missionDronesService.findById(id);
    return new MissionDroneResponseDto(missionDrone);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mission-drone assignment' })
  @ApiResponse({
    status: 200,
    description: 'Mission-drone assignment updated successfully',
    type: MissionDroneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mission-drone assignment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMissionDroneDto: UpdateMissionDroneDto,
  ): Promise<MissionDroneResponseDto> {
    const missionDrone = await this.missionDronesService.update(id, updateMissionDroneDto);
    return new MissionDroneResponseDto(missionDrone);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove drone from mission' })
  @ApiResponse({ status: 200, description: 'Drone removed from mission successfully' })
  @ApiResponse({ status: 404, description: 'Mission-drone assignment not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.missionDronesService.delete(id);
  }
}

