import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { MissionStatus } from '../../entities/mission.entity';
import {
  CreateFlightDto,
  UpdateFlightDto,
  FlightResponseDto,
  StartFlightDto,
  EndFlightDto,
  AddPathPointDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Flights')
@Controller('api/v1/flights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({ status: 201, description: 'Flight created successfully', type: FlightResponseDto })
  async create(@Body() createFlightDto: CreateFlightDto): Promise<FlightResponseDto> {
    const flight = await this.flightsService.create(createFlightDto);
    return new FlightResponseDto(flight);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flights' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully', type: [FlightResponseDto] })
  async findAll(): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findAll();
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active flights' })
  @ApiResponse({ status: 200, description: 'Active flights retrieved successfully', type: [FlightResponseDto] })
  async findActive(): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findActiveFlights();
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get flights by status' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully', type: [FlightResponseDto] })
  async findByStatus(@Param('status') status: MissionStatus): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findByStatus(status);
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get('pilot/:pilotId')
  @ApiOperation({ summary: 'Get flights by pilot' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully', type: [FlightResponseDto] })
  async findByPilot(@Param('pilotId') pilotId: number): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findByPilot(pilotId);
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get('drone/:droneId')
  @ApiOperation({ summary: 'Get flights by drone' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully', type: [FlightResponseDto] })
  async findByDrone(@Param('droneId') droneId: number): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findByDrone(droneId);
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get flights by date range' })
  @ApiResponse({ status: 200, description: 'Flights retrieved successfully', type: [FlightResponseDto] })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<FlightResponseDto[]> {
    const flights = await this.flightsService.findFlightsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    return flights.map(flight => new FlightResponseDto(flight));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight by ID' })
  @ApiResponse({ status: 200, description: 'Flight retrieved successfully', type: FlightResponseDto })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async findOne(@Param('id') id: number): Promise<FlightResponseDto> {
    const flight = await this.flightsService.findById(id);
    return new FlightResponseDto(flight);
  }

  @Get(':id/path')
  @ApiOperation({ summary: 'Get flight path' })
  @ApiResponse({ status: 200, description: 'Flight path retrieved successfully' })
  async getFlightPath(@Param('id') id: number) {
    return await this.flightsService.getFlightPath(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight' })
  @ApiResponse({ status: 200, description: 'Flight updated successfully', type: FlightResponseDto })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async update(
    @Param('id') id: number,
    @Body() updateFlightDto: UpdateFlightDto,
  ): Promise<FlightResponseDto> {
    const flight = await this.flightsService.update(id, updateFlightDto);
    return new FlightResponseDto(flight);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start flight' })
  @ApiResponse({ status: 200, description: 'Flight started successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async startFlight(
    @Param('id') id: number,
    @Body() startFlightDto: StartFlightDto,
  ): Promise<void> {
    await this.flightsService.startFlight(id, startFlightDto);
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'End flight' })
  @ApiResponse({ status: 200, description: 'Flight ended successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async endFlight(
    @Param('id') id: number,
    @Body() endFlightDto: EndFlightDto,
  ): Promise<void> {
    await this.flightsService.endFlight(id, endFlightDto);
  }

  @Post(':id/path-point')
  @ApiOperation({ summary: 'Add path point to flight' })
  @ApiResponse({ status: 201, description: 'Path point added successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async addPathPoint(
    @Param('id') id: number,
    @Body() addPathPointDto: AddPathPointDto,
  ) {
    return await this.flightsService.addPathPoint(id, addPathPointDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete flight' })
  @ApiResponse({ status: 200, description: 'Flight deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async remove(@Param('id') id: number): Promise<void> {
    await this.flightsService.delete(id);
  }
}
