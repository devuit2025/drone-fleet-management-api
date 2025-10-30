import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DroneModel } from '../../entities/drone-model.entity';
import { CreateDroneModelDto, UpdateDroneModelDto } from './dto';
import { DroneModelRepository } from '../../repositories/drone-model.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class DroneModelsService extends BaseService<DroneModel> {
  constructor(
    private readonly droneModelRepo: DroneModelRepository,
  ) { super(droneModelRepo, 'Drone model'); }

  async create(createDroneModelDto: CreateDroneModelDto): Promise<DroneModel> {
    const existingModel = await this.droneModelRepo.searchOne({ where: { name: createDroneModelDto.name } });
    if (existingModel) {
      throw new ConflictException('Model with this name already exists');
    }

    return await this.droneModelRepo.create(createDroneModelDto);
  }

  // Inherit findAll(per,page)

  // Inherit findById

  async update(id: number, updateDroneModelDto: UpdateDroneModelDto): Promise<DroneModel> {
    const current = await this.findById(id);
    if (updateDroneModelDto.name && updateDroneModelDto.name !== current.name) {
      const existingModel = await this.droneModelRepo.searchOne({ where: { name: updateDroneModelDto.name } });
      if (existingModel) throw new ConflictException('Model with this name already exists');
    }
    return await this.droneModelRepo.update(id, updateDroneModelDto);
  }

  // delete inherited
}

