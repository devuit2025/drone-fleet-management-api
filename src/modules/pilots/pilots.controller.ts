import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pilot, PilotStatus } from '../../entities/pilot.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePilotDto, PilotResponseDto } from './dto';

@ApiTags('Pilots')
@Controller('api/v1/pilots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PilotsController {
  constructor(
    @InjectRepository(Pilot)
    private readonly pilotRepository: Repository<Pilot>,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all pilots' })
  @ApiResponse({ status: 200, description: 'List of all pilots', type: [PilotResponseDto] })
  async findAll(): Promise<PilotResponseDto[]> {
    const pilots = await this.pilotRepository.find();
    return pilots.map(pilot => new PilotResponseDto(pilot));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pilot' })
  @ApiResponse({ status: 201, description: 'Pilot created successfully', type: PilotResponseDto })
  async create(@Body() createPilotDto: CreatePilotDto): Promise<PilotResponseDto> {
    const pilot = this.pilotRepository.create({
      userId: createPilotDto.userId,
      name: createPilotDto.name,
      status: createPilotDto.status || PilotStatus.ACTIVE,
    });
    const savedPilot = await this.pilotRepository.save(pilot);
    return new PilotResponseDto(savedPilot);
  }
}
