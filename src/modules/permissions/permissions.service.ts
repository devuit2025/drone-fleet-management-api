import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { PermissionRepository } from '../../repositories/permission.repository';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionRepo: PermissionRepository,
  ) { }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepo.findByName(createPermissionDto.name);
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepo.findAll();
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findById(id);

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionRepo.findByName(updatePermissionDto.name);
      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    if (updatePermissionDto.name) permission.name = updatePermissionDto.name;
    if (updatePermissionDto.description !== undefined) permission.description = updatePermissionDto.description;

    return await this.permissionRepository.save(permission);
  }

  async delete(id: number): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionRepository.remove(permission);
  }
}

