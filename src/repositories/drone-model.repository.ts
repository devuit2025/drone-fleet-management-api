import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DroneModel } from '../entities/drone-model.entity';

@Injectable()
export class DroneModelRepository extends BaseRepository<DroneModel> {
  protected relationForList = ['brand', 'category', 'drones'];
  protected relationForDetail = ['brand', 'category', 'drones'];

  constructor(
    @InjectRepository(DroneModel)
    private readonly droneModelRepository: Repository<DroneModel>,
  ) {
    super(droneModelRepository);
  }

  async findByBrandId(brandId: number): Promise<DroneModel[]> {
    return await this.droneModelRepository.find({
      where: { brandId },
      relations: ['brand'],
    });
  }

  async findByCategoryId(categoryId: number): Promise<DroneModel[]> {
    return await this.droneModelRepository.find({
      where: { categoryId },
      relations: ['category'],
    });
  }
}
