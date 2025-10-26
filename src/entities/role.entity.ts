import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Role ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Role name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Role description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Permissions associated with this role' })
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

