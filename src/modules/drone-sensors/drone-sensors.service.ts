import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneSensor, SensorStatus } from '../../entities/drone-sensor.entity';
import { CreateDroneSensorDto, UpdateDroneSensorDto } from './dto';
import { DroneSensorRepository } from '../../repositories/drone-sensor.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class DroneSensorsService extends BaseService<DroneSensor> {
  constructor(
    @InjectRepository(DroneSensor)
    private readonly droneSensorRepository: Repository<DroneSensor>,
    private readonly droneSensorRepo: DroneSensorRepository,
  ) { super(droneSensorRepo, 'Drone sensor'); }

  async create(createDroneSensorDto: CreateDroneSensorDto): Promise<DroneSensor> {
    const droneSensor = this.droneSensorRepository.create({
      ...createDroneSensorDto,
      status: createDroneSensorDto.status || SensorStatus.ACTIVE,
    });
    return await this.droneSensorRepository.save(droneSensor);
  }

  // Inherit findAll(per,page)

  // Inherit findById

  async findByDroneId(droneId: number): Promise<DroneSensor[]> {
    return await this.droneSensorRepository.find({
      where: { droneId },
      relations: ['drone'],
    });
  }

  async update(
    id: number,
    updateDroneSensorDto: UpdateDroneSensorDto,
  ): Promise<DroneSensor> {
    const droneSensor = await this.findById(id);
    Object.assign(droneSensor, updateDroneSensorDto);
    return await this.droneSensorRepository.save(droneSensor);
  }

  // delete inherited
}

