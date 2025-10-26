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
import { DroneBrandsService } from './drone-brands.service';
import { CreateDroneBrandDto, UpdateDroneBrandDto, DroneBrandResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Drone Brands')
@Controller('api/v1/drone-brands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DroneBrandsController {
  constructor(private readonly droneBrandsService: DroneBrandsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new drone brand' })
  @ApiResponse({
    status: 201,
    description: 'Drone brand created successfully',
    type: DroneBrandResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Brand with this name already exists' })
  async create(@Body() createDroneBrandDto: CreateDroneBrandDto): Promise<DroneBrandResponseDto> {
    const droneBrand = await this.droneBrandsService.create(createDroneBrandDto);
    return new DroneBrandResponseDto(droneBrand);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drone brands' })
  @ApiResponse({
    status: 200,
    description: 'List of all drone brands',
    type: [DroneBrandResponseDto],
  })
  async findAll(): Promise<DroneBrandResponseDto[]> {
    const droneBrands = await this.droneBrandsService.findAll();
    return droneBrands.map((brand) => new DroneBrandResponseDto(brand));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drone brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Drone brand retrieved successfully',
    type: DroneBrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone brand not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DroneBrandResponseDto> {
    const droneBrand = await this.droneBrandsService.findById(id);
    return new DroneBrandResponseDto(droneBrand);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drone brand' })
  @ApiResponse({
    status: 200,
    description: 'Drone brand updated successfully',
    type: DroneBrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Drone brand not found' })
  @ApiResponse({ status: 409, description: 'Brand with this name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDroneBrandDto: UpdateDroneBrandDto,
  ): Promise<DroneBrandResponseDto> {
    const droneBrand = await this.droneBrandsService.update(id, updateDroneBrandDto);
    return new DroneBrandResponseDto(droneBrand);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drone brand' })
  @ApiResponse({ status: 200, description: 'Drone brand deleted successfully' })
  @ApiResponse({ status: 404, description: 'Drone brand not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.droneBrandsService.delete(id);
  }
}

