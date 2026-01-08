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
import { FlightPermitsService } from './flight-permits.service';
import { CreateFlightPermitDto, UpdateFlightPermitDto, FlightPermitResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Flight Permits')
@Controller('api/v1/flight-permits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FlightPermitsController extends BaseController {
  constructor(private readonly flightPermitsService: FlightPermitsService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new flight permit' })
  @ApiResponse({
    status: 201,
    description: 'Flight permit created successfully',
    type: FlightPermitResponseDto,
  })
  async create(@Body() createFlightPermitDto: CreateFlightPermitDto): Promise<FlightPermitResponseDto> {
    const permit = await this.flightPermitsService.create(createFlightPermitDto);
    return new FlightPermitResponseDto(permit);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flight permits' })
  @ApiResponse({
    status: 200,
    description: 'Flight permits retrieved successfully',
    type: [FlightPermitResponseDto],
  })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<FlightPermitResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.flightPermitsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((permit) => new FlightPermitResponseDto(permit as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight permit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Flight permit retrieved successfully',
    type: FlightPermitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flight permit not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FlightPermitResponseDto> {
    const permit = await this.flightPermitsService.findById(id);
    return new FlightPermitResponseDto(permit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight permit' })
  @ApiResponse({
    status: 200,
    description: 'Flight permit updated successfully',
    type: FlightPermitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Flight permit not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlightPermitDto: UpdateFlightPermitDto,
  ): Promise<FlightPermitResponseDto> {
    const permit = await this.flightPermitsService.update(id, updateFlightPermitDto);
    return new FlightPermitResponseDto(permit);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete flight permit' })
  @ApiResponse({ status: 200, description: 'Flight permit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight permit not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.flightPermitsService.delete(id);
  }
}



