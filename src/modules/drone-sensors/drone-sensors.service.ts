import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneSensor, SensorStatus } from '../../entities/drone-sensor.entity';
import { CreateDroneSensorDto, UpdateDroneSensorDto } from './dto';

@Injectable()
export class DroneSensorsService {
  constructor(
    @InjectRepository(DroneSensor)
    private readonly droneSensorRepository: Repository<DroneSensor>,
  ) { }

  async create(createDroneSensorDto: CreateDroneSensorDto): Promise<DroneSensor> {
    const droneSensor = this.droneSensorRepository.create({
      ...createDroneSensorDto,
      status: createDroneSensorDto.status || SensorStatus.ACTIVE,
    });
    return await this.droneSensorRepository.save(droneSensor);
  }

  async findAll(): Promise<DroneSensor[]> {
    return await this.droneSensorRepository.find({
      relations: ['drone'],
    });
  }

  async findById(id: number): Promise<DroneSensor> {
    const droneSensor = await this.droneSensorRepository.findOne({
      where: { id },
      relations: ['drone'],
    });
    if (!droneSensor) {
      throw new NotFoundException('Drone sensor not found');
    }
    return droneSensor;
  }

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

  async delete(id: number): Promise<void> {
    const droneSensor = await this.findById(id);
    await this.droneSensorRepository.remove(droneSensor);
  }
}

