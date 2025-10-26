import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { RoleRepository } from '../../repositories/role.repository';
import { PermissionRepository } from '../../repositories/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository, PermissionRepository],
  exports: [RolesService],
})
export class RolesModule { }

