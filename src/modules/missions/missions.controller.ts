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
    Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { CreateMissionDto, UpdateMissionDto, MissionResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Missions')
@Controller('api/v1/missions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionsController extends BaseController {
    constructor(private readonly missionsService: MissionsService) { super(); }

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
    async findAll(
        @Query() query: any,
        @Res({ passthrough: true }) res?: Response,
    ): Promise<MissionResponseDto[]> {
        const { page, per, ...filters } = query;
        const currentPage = this.parsePage(page);
        const perPage = this.parsePer(per);
        const result = await this.missionsService.findAll({
            ...filters,
            page: currentPage,
            per: perPage,
        });
        const { data, total } = this.normalizeListResult(result);
        if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
        return (data as any[]).map((mission) => new MissionResponseDto(mission as any));
    }

    @Get('monitoring')
    @ApiOperation({ summary: 'Get missions for monitoring (includes missionDrones and waypoints)' })
    @ApiResponse({
        status: 200,
        description: 'Missions retrieved successfully with full relations',
        type: [MissionResponseDto],
    })
    async findAllForMonitoring(): Promise<MissionResponseDto[]> {
        const missions = await this.missionsService.findAllForMonitoring();
        return missions.map((mission) => new MissionResponseDto(mission as any));
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
        const mission = await this.missionsService.update(id, updateMissionDto as any);
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
