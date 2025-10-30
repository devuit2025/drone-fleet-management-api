import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneCategory } from '../../entities/drone-category.entity';
import { CreateDroneCategoryDto, UpdateDroneCategoryDto } from './dto';
import { DroneCategoryRepository } from '../../repositories/drone-category.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class DroneCategoriesService extends BaseService<DroneCategory> {
  constructor(
    @InjectRepository(DroneCategory)
    private readonly droneCategoryRepository: Repository<DroneCategory>,
    private readonly droneCategoryRepo: DroneCategoryRepository,
  ) { super(droneCategoryRepo, 'Drone category'); }

  async create(createDroneCategoryDto: CreateDroneCategoryDto): Promise<DroneCategory> {
    const existingCategory = await this.droneCategoryRepo.findByName(createDroneCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const droneCategory = this.droneCategoryRepository.create(createDroneCategoryDto);
    return await this.droneCategoryRepository.save(droneCategory);
  }

  // Inherit findAll(per,page)

  // Inherit findById

  async update(
    id: number,
    updateDroneCategoryDto: UpdateDroneCategoryDto,
  ): Promise<DroneCategory> {
    const droneCategory = await this.findById(id);

    if (updateDroneCategoryDto.name && updateDroneCategoryDto.name !== droneCategory.name) {
      const existingCategory = await this.droneCategoryRepo.findByName(updateDroneCategoryDto.name);
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    if (updateDroneCategoryDto.name) droneCategory.name = updateDroneCategoryDto.name;
    if (updateDroneCategoryDto.description !== undefined)
      droneCategory.description = updateDroneCategoryDto.description;

    return await this.droneCategoryRepository.save(droneCategory);
  }

  // delete inherited
}

