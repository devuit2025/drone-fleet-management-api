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

@Entity('drone_brands')
export class DroneBrand {
  @ApiProperty({ description: 'Drone Brand ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Brand name' })
  @Column({ unique: true })
  name: string;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Country of origin', nullable: true })
  @Column({ nullable: true })
  country: string | null;

  @ApiProperty({ description: 'Website URL', nullable: true })
  @Column({ nullable: true })
  website: string | null;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DroneModel, model => model.brand, { createForeignKeyConstraints: false })
  models: DroneModel[];
}

