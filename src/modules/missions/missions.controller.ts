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
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { MissionStatus } from '../../entities/mission.entity';
import {
    CreateMissionDto,
    UpdateMissionDto,
    MissionResponseDto,
    StartMissionDto,
    EndMissionDto,
    AddPathPointDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Missions')
@Controller('api/v1/missions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionsController {
    constructor(private readonly missionsService: MissionsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new mission' })
    @ApiResponse({
        status: 201,
        description: 'Mission created successfully',
        type: MissionResponseDto,
    })
    async create(@Body() createMissionDto: CreateMissionDto): Promise<MissionResponseDto> {
        const mission = await this.missionsService.create(createMissionDto);
        return new MissionResponseDto(mission);
    }

    @Get()
    @ApiOperation({ summary: 'Get all flights' })
    @ApiResponse({
        status: 200,
        description: 'Flights retrieved successfully',
        type: [MissionResponseDto],
    })
    async findAll(): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findAll();
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active flights' })
    @ApiResponse({
        status: 200,
        description: 'Active flights retrieved successfully',
        type: [MissionResponseDto],
    })
    async findActive(): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findActiveFlights();
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get flights by status' })
    @ApiResponse({
        status: 200,
        description: 'Flights retrieved successfully',
        type: [MissionResponseDto],
    })
    async findByStatus(@Param('status') status: MissionStatus): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findByStatus(status);
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get('pilot/:pilotId')
    @ApiOperation({ summary: 'Get flights by pilot' })
    @ApiResponse({
        status: 200,
        description: 'Flights retrieved successfully',
        type: [MissionResponseDto],
    })
    async findByPilot(@Param('pilotId', ParseIntPipe) pilotId: number): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findByPilot(pilotId);
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get('drone/:droneId')
    @ApiOperation({ summary: 'Get flights by drone' })
    @ApiResponse({
        status: 200,
        description: 'Flights retrieved successfully',
        type: [MissionResponseDto],
    })
    async findByDrone(@Param('droneId', ParseIntPipe) droneId: number): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findByDrone(droneId);
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get('date-range')
    @ApiOperation({ summary: 'Get flights by date range' })
    @ApiResponse({
        status: 200,
        description: 'Flights retrieved successfully',
        type: [MissionResponseDto],
    })
    @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
    @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
    async findByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ): Promise<MissionResponseDto[]> {
        const flights = await this.missionsService.findFlightsByDateRange(
            new Date(startDate),
            new Date(endDate),
        );
        return flights.map(flight => new MissionResponseDto(flight));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get flight by ID' })
    @ApiResponse({
        status: 200,
        description: 'Flight retrieved successfully',
        type: MissionResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<MissionResponseDto> {
        const flight = await this.missionsService.findById(id);
        return new MissionResponseDto(flight);
    }

    @Get(':id/path')
    @ApiOperation({ summary: 'Get flight path' })
    @ApiResponse({ status: 200, description: 'Flight path retrieved successfully' })
    async getFlightPath(@Param('id', ParseIntPipe) id: number) {
        return await this.missionsService.getFlightPath(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update flight' })
    @ApiResponse({
        status: 200,
        description: 'Flight updated successfully',
        type: MissionResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFlightDto: UpdateMissionDto,
    ): Promise<MissionResponseDto> {
        const flight = await this.missionsService.update(id, updateFlightDto);
        return new MissionResponseDto(flight);
    }

    @Patch(':id/start')
    @ApiOperation({ summary: 'Start flight' })
    @ApiResponse({ status: 200, description: 'Flight started successfully' })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async startFlight(
        @Param('id', ParseIntPipe) id: number,
        @Body() startFlightDto: StartMissionDto,
    ): Promise<void> {
        await this.missionsService.startFlight(id, startFlightDto);
    }

    @Patch(':id/end')
    @ApiOperation({ summary: 'End flight' })
    @ApiResponse({ status: 200, description: 'Flight ended successfully' })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async endFlight(@Param('id', ParseIntPipe) id: number, @Body() endFlightDto: EndMissionDto): Promise<void> {
        await this.missionsService.endFlight(id, endFlightDto);
    }

    @Post(':id/path-point')
    @ApiOperation({ summary: 'Add path point to flight' })
    @ApiResponse({ status: 201, description: 'Path point added successfully' })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async addPathPoint(@Param('id', ParseIntPipe) id: number, @Body() addPathPointDto: AddPathPointDto) {
        return await this.missionsService.addPathPoint(id, addPathPointDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete flight' })
    @ApiResponse({ status: 200, description: 'Flight deleted successfully' })
    @ApiResponse({ status: 404, description: 'Flight not found' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.missionsService.delete(id);
    }
}
