import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { DroneBrand } from './drone-brand.entity';
import { DroneCategory } from './drone-category.entity';

@Entity('drone_models')
export class DroneModel {
  @ApiProperty({ description: 'Drone Model ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Brand ID', type: Number })
  @Column({ name: 'brand_id' })
  brandId: number;

  @ApiProperty({ description: 'Category ID', type: Number })
  @Column({ name: 'category_id' })
  categoryId: number;

  @Searchable({ operator: 'like' })
  @ApiProperty({ description: 'Model name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Maximum speed (km/h)', nullable: true })
  @Column({ name: 'max_speed', type: 'numeric', nullable: true })
  maxSpeed: number | null;

  @ApiProperty({ description: 'Maximum altitude (m)', nullable: true })
  @Column({ name: 'max_altitude', type: 'numeric', nullable: true })
  maxAltitude: number | null;

  @ApiProperty({ description: 'Maximum flight time (minutes)', nullable: true })
  @Column({ name: 'max_flight_time', type: 'numeric', nullable: true })
  maxFlightTime: number | null;

  @ApiProperty({ description: 'Maximum payload (g)', nullable: true })
  @Column({ name: 'max_payload', type: 'numeric', nullable: true })
  maxPayload: number | null;

  @ApiProperty({ description: 'Battery capacity (mAh)', nullable: true })
  @Column({ name: 'battery_capacity', type: 'numeric', nullable: true })
  batteryCapacity: number | null;

  @ApiProperty({ description: 'Dimensions (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  } | null;

  @ManyToOne(() => DroneBrand, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'brand_id' })
  brand: DroneBrand;

  @ManyToOne(() => DroneCategory, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'category_id' })
  category: DroneCategory;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

