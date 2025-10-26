import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DroneBrand } from '../entities/drone-brand.entity';

@Injectable()
export class DroneBrandRepository extends BaseRepository<DroneBrand> {
  constructor(
    @InjectRepository(DroneBrand)
    private readonly droneBrandRepository: Repository<DroneBrand>,
  ) {
    super(droneBrandRepository);
  }

  async findByName(name: string): Promise<DroneBrand | null> {
    return await this.droneBrandRepository.findOne({
      where: { name },
    });
  }
}
