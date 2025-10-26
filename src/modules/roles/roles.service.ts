import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RoleRepository } from '../../repositories/role.repository';
import { PermissionRepository } from '../../repositories/permission.repository';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly roleRepo: RoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionRepo: PermissionRepository,
  ) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepo.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepo.findAll({
      relations: ['permissions'],
      sort: 'name',
    });
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepo.findByName(updateRoleDto.name);
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findBy({
        id: In(updateRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  async delete(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findById(roleId);

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      role.permissions = [...role.permissions, ...permissions];
      return await this.roleRepository.save(role);
    }

    return role;
  }

  async removePermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findById(roleId);

    if (permissionIds && permissionIds.length > 0) {
      role.permissions = role.permissions.filter(
        permission => !permissionIds.includes(permission.id)
      );
      return await this.roleRepository.save(role);
    }

    return role;
  }

  async setPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findById(roleId);

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    return await this.roleRepository.save(role);
  }
}

