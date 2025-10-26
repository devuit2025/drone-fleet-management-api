import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  protected relations = ['roles'];

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

  async findByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { name },
    });
  }
}
