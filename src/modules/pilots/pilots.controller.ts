import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pilot, PilotStatus } from '../../entities/pilot.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePilotDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Pilot name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Pilot status', enum: PilotStatus, required: false })
  @IsOptional()
  @IsEnum(PilotStatus)
  status?: PilotStatus;
}

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
  @ApiResponse({ status: 200, description: 'List of all pilots' })
  async findAll(): Promise<Pilot[]> {
    return await this.pilotRepository.find();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pilot' })
  @ApiResponse({ status: 201, description: 'Pilot created successfully' })
  async create(@Body() createPilotDto: CreatePilotDto): Promise<Pilot> {
    const pilot = this.pilotRepository.create({
      ...createPilotDto,
      status: createPilotDto.status || PilotStatus.ACTIVE,
    });
    return await this.pilotRepository.save(pilot);
  }
}
