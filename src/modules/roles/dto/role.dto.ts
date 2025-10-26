import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Permission IDs', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Permission IDs', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID' })
  id: number;

  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Role description' })
  description: string;

  @ApiProperty({ description: 'Permissions' })
  permissions: Permission[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(role: Role) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.permissions = role.permissions;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}

