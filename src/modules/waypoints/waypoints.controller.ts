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
import { WaypointsService } from './waypoints.service';
import { CreateWaypointDto, UpdateWaypointDto, WaypointResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Waypoints')
@Controller('api/v1/waypoints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WaypointsController {
  constructor(private readonly waypointsService: WaypointsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new waypoint' })
  @ApiResponse({
    status: 201,
    description: 'Waypoint created successfully',
    type: WaypointResponseDto,
  })
  async create(@Body() createWaypointDto: CreateWaypointDto): Promise<WaypointResponseDto> {
    const waypoint = await this.waypointsService.create(createWaypointDto);
    return new WaypointResponseDto(waypoint);
  }

  @Get()
  @ApiOperation({ summary: 'Get all waypoints' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiResponse({
    status: 200,
    description: 'Waypoints retrieved successfully',
    type: [WaypointResponseDto],
  })
  async findAll(@Query('missionId') missionId?: string): Promise<WaypointResponseDto[]> {
    if (missionId) {
      const waypoints = await this.waypointsService.findByMissionId(parseInt(missionId, 10));
      return waypoints.map((waypoint) => new WaypointResponseDto(waypoint));
    }
    const waypoints = await this.waypointsService.findAll();
    return waypoints.map((waypoint) => new WaypointResponseDto(waypoint));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get waypoint by ID' })
  @ApiResponse({
    status: 200,
    description: 'Waypoint retrieved successfully',
    type: WaypointResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Waypoint not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WaypointResponseDto> {
    const waypoint = await this.waypointsService.findById(id);
    return new WaypointResponseDto(waypoint);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update waypoint' })
  @ApiResponse({
    status: 200,
    description: 'Waypoint updated successfully',
    type: WaypointResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Waypoint not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWaypointDto: UpdateWaypointDto,
  ): Promise<WaypointResponseDto> {
    const waypoint = await this.waypointsService.update(id, updateWaypointDto);
    return new WaypointResponseDto(waypoint);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete waypoint' })
  @ApiResponse({ status: 200, description: 'Waypoint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Waypoint not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.waypointsService.delete(id);
  }
}

