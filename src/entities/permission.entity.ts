import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty({ description: 'Permission ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Permission name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Permission description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Roles that have this permission' })
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

