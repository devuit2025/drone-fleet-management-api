import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneCategory } from '../../entities/drone-category.entity';
import { CreateDroneCategoryDto, UpdateDroneCategoryDto } from './dto';
import { DroneCategoryRepository } from '../../repositories/drone-category.repository';

@Injectable()
export class DroneCategoriesService {
  constructor(
    @InjectRepository(DroneCategory)
    private readonly droneCategoryRepository: Repository<DroneCategory>,
    private readonly droneCategoryRepo: DroneCategoryRepository,
  ) { }

  async create(createDroneCategoryDto: CreateDroneCategoryDto): Promise<DroneCategory> {
    const existingCategory = await this.droneCategoryRepo.findByName(createDroneCategoryDto.name);
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const droneCategory = this.droneCategoryRepository.create(createDroneCategoryDto);
    return await this.droneCategoryRepository.save(droneCategory);
  }

  async findAll(): Promise<DroneCategory[]> {
    return await this.droneCategoryRepo.findAll();
  }

  async findById(id: number): Promise<DroneCategory> {
    const droneCategory = await this.droneCategoryRepository.findOne({
      where: { id },
    });
    if (!droneCategory) {
      throw new NotFoundException('Drone category not found');
    }
    return droneCategory;
  }

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

  async delete(id: number): Promise<void> {
    const droneCategory = await this.findById(id);
    await this.droneCategoryRepository.remove(droneCategory);
  }
}

