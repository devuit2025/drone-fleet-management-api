import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Permission } from '../../../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Permission name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID' })
  id: number;

  @ApiProperty({ description: 'Permission name' })
  name: string;

  @ApiProperty({ description: 'Permission description' })
  description: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(permission: Permission) {
    this.id = permission.id;
    this.name = permission.name;
    this.description = permission.description;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}

