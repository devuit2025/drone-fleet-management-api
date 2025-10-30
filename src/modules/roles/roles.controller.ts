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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../../common/base.controller';
import { Response } from 'express';

@ApiTags('Roles')
@Controller('api/v1/roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController extends BaseController {
  constructor(private readonly rolesService: RolesService) { super(); }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesService.create(createRoleDto);
    return new RoleResponseDto(role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  async findAll(
    @Query() query: any,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<RoleResponseDto[]> {
    const { page, per, ...filters } = query;
    const currentPage = this.parsePage(page);
    const perPage = this.parsePer(per);
    const result = await this.rolesService.findAll({
      ...filters,
      page: currentPage,
      per: perPage,
    });
    const { data, total } = this.normalizeListResult(result);
    if (res) this.setPaginationHeaders(res, currentPage, perPage, total);
    return (data as any[]).map((role) => new RoleResponseDto(role as any));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    const role = await this.rolesService.findById(id);
    return new RoleResponseDto(role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.update(id, updateRoleDto);
    return new RoleResponseDto(role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.delete(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.assignPermissions(id, body.permissionIds);
    return new RoleResponseDto(role);
  }

  @Delete(':id/permissions')
  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async removePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.removePermissions(id, body.permissionIds);
    return new RoleResponseDto(role);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Set permissions for role (replace all)' })
  @ApiResponse({ status: 200, description: 'Permissions set successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ): Promise<RoleResponseDto> {
    const role = await this.rolesService.setPermissions(id, body.permissionIds);
    return new RoleResponseDto(role);
  }
}

