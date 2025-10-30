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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Permissions')
@Controller('api/v1/permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController extends BaseController {
  constructor(private readonly permissionsService: PermissionsService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.create(createPermissionDto);
    return new PermissionResponseDto(permission);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully', type: [PermissionResponseDto] })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<PermissionResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.permissionsService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map(permission => new PermissionResponseDto(permission as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.findById(id);
    return new PermissionResponseDto(permission);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsService.update(id, updatePermissionDto);
    return new PermissionResponseDto(permission);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.permissionsService.delete(id);
  }
}

