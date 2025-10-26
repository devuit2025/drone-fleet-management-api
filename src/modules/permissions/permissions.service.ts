import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createPermissionDto.name },
    });
    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
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
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updatePermissionDto.name },
      });
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

