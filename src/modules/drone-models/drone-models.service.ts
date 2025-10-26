import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneModel } from '../../entities/drone-model.entity';
import { CreateDroneModelDto, UpdateDroneModelDto } from './dto';
import { DroneModelRepository } from '../../repositories/drone-model.repository';

@Injectable()
export class DroneModelsService {
  constructor(
    @InjectRepository(DroneModel)
    private readonly droneModelRepository: Repository<DroneModel>,
    private readonly droneModelRepo: DroneModelRepository,
  ) { }

  async create(createDroneModelDto: CreateDroneModelDto): Promise<DroneModel> {
    const existingModel = await this.droneModelRepository.findOne({
      where: { name: createDroneModelDto.name },
    });
    if (existingModel) {
      throw new ConflictException('Model with this name already exists');
    }

    const droneModel = this.droneModelRepository.create(createDroneModelDto);
    return await this.droneModelRepository.save(droneModel);
  }

  async findAll(): Promise<DroneModel[]> {
    return await this.droneModelRepo.findAll({
      relations: ['brand', 'category'],
    });
  }

  async findById(id: number): Promise<DroneModel> {
    const droneModel = await this.droneModelRepository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    if (!droneModel) {
      throw new NotFoundException('Drone model not found');
    }
    return droneModel;
  }

  async update(
    id: number,
    updateDroneModelDto: UpdateDroneModelDto,
  ): Promise<DroneModel> {
    const droneModel = await this.findById(id);

    if (updateDroneModelDto.name && updateDroneModelDto.name !== droneModel.name) {
      const existingModel = await this.droneModelRepository.findOne({
        where: { name: updateDroneModelDto.name },
      });
      if (existingModel) {
        throw new ConflictException('Model with this name already exists');
      }
    }

    Object.assign(droneModel, updateDroneModelDto);
    return await this.droneModelRepository.save(droneModel);
  }

  async delete(id: number): Promise<void> {
    const droneModel = await this.findById(id);
    await this.droneModelRepository.remove(droneModel);
  }
}

