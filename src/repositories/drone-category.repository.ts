import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DroneCategory } from '../entities/drone-category.entity';

@Injectable()
export class DroneCategoryRepository extends BaseRepository<DroneCategory> {
  constructor(
    @InjectRepository(DroneCategory)
    private readonly droneCategoryRepository: Repository<DroneCategory>,
  ) {
    super(droneCategoryRepository);
  }

  async findByName(name: string): Promise<DroneCategory | null> {
    return await this.droneCategoryRepository.findOne({
      where: { name },
    });
  }
}
