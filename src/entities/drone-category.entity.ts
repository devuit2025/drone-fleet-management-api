import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { DroneModel } from './drone-model.entity';

@Entity('drone_categories')
export class DroneCategory {
  @ApiProperty({ description: 'Drone Category ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Category name' })
  @Column({ unique: true })
  name: string;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Category description', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DroneModel, model => model.category, { createForeignKeyConstraints: false })
  models: DroneModel[];
}

