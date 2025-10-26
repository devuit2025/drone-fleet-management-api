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
import { NoFlyZonesService } from './no-fly-zones.service';
import { CreateNoFlyZoneDto, UpdateNoFlyZoneDto, NoFlyZoneResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('No-Fly Zones')
@Controller('api/v1/no-fly-zones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NoFlyZonesController {
  constructor(private readonly noFlyZonesService: NoFlyZonesService) { }

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
  async findAll(): Promise<NoFlyZoneResponseDto[]> {
    const noFlyZones = await this.noFlyZonesService.findAll();
    return noFlyZones.map((zone) => new NoFlyZoneResponseDto(zone));
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

