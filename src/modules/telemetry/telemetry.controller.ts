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
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto, UpdateTelemetryDto, TelemetryResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Telemetry')
@Controller('api/v1/telemetry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new telemetry record' })
  @ApiResponse({
    status: 201,
    description: 'Telemetry record created successfully',
    type: TelemetryResponseDto,
  })
  async create(@Body() createTelemetryDto: CreateTelemetryDto): Promise<TelemetryResponseDto> {
    const telemetry = await this.telemetryService.create(createTelemetryDto);
    return new TelemetryResponseDto(telemetry);
  }

  @Get()
  @ApiOperation({ summary: 'Get all telemetry records' })
  @ApiQuery({ name: 'droneId', required: false, description: 'Filter by drone ID' })
  @ApiQuery({ name: 'missionId', required: false, description: 'Filter by mission ID' })
  @ApiResponse({
    status: 200,
    description: 'Telemetry records retrieved successfully',
    type: [TelemetryResponseDto],
  })
  async findAll(
    @Query('droneId') droneId?: string,
    @Query('missionId') missionId?: string,
  ): Promise<TelemetryResponseDto[]> {
    let telemetry;

    if (droneId) {
      telemetry = await this.telemetryService.findByDrone(parseInt(droneId, 10));
    } else if (missionId) {
      telemetry = await this.telemetryService.findByMission(parseInt(missionId, 10));
    } else {
      telemetry = await this.telemetryService.findAll();
    }

    return telemetry.map((t) => new TelemetryResponseDto(t));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get telemetry record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Telemetry record retrieved successfully',
    type: TelemetryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Telemetry record not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TelemetryResponseDto> {
    const telemetry = await this.telemetryService.findById(id);
    return new TelemetryResponseDto(telemetry);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete telemetry record' })
  @ApiResponse({ status: 200, description: 'Telemetry record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Telemetry record not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.telemetryService.delete(id);
  }
}

