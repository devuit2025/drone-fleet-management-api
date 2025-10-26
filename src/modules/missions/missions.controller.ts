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
import { MissionsService } from './missions.service';
import { CreateMissionDto, UpdateMissionDto, MissionResponseDto } from './dto';
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
    @ApiOperation({ summary: 'Get all missions' })
    @ApiResponse({
        status: 200,
        description: 'Missions retrieved successfully',
        type: [MissionResponseDto],
    })
    async findAll(): Promise<MissionResponseDto[]> {
        const missions = await this.missionsService.findAll();
        return missions.map((mission) => new MissionResponseDto(mission));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get mission by ID' })
    @ApiResponse({
        status: 200,
        description: 'Mission retrieved successfully',
        type: MissionResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mission not found' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<MissionResponseDto> {
        const mission = await this.missionsService.findById(id);
        return new MissionResponseDto(mission);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update mission' })
    @ApiResponse({
        status: 200,
        description: 'Mission updated successfully',
        type: MissionResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mission not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMissionDto: UpdateMissionDto,
    ): Promise<MissionResponseDto> {
        const mission = await this.missionsService.update(id, updateMissionDto);
        return new MissionResponseDto(mission);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete mission' })
    @ApiResponse({ status: 200, description: 'Mission deleted successfully' })
    @ApiResponse({ status: 404, description: 'Mission not found' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.missionsService.delete(id);
    }
}
