import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DroneSensor } from '../entities/drone-sensor.entity';

@Injectable()
export class DroneSensorRepository extends BaseRepository<DroneSensor> {
  constructor(
    @InjectRepository(DroneSensor)
    private readonly droneSensorRepository: Repository<DroneSensor>,
  ) {
    super(droneSensorRepository);
  }

  async findByDroneId(droneId: number): Promise<DroneSensor[]> {
    return await this.droneSensorRepository.find({
      where: { droneId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByType(type: string): Promise<DroneSensor[]> {
    return await this.droneSensorRepository.find({
      where: { type },
    });
  }
}
