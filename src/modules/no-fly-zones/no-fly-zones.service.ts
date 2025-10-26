import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';
import { CreateNoFlyZoneDto, UpdateNoFlyZoneDto } from './dto';

@Injectable()
export class NoFlyZonesService {
  constructor(
    @InjectRepository(NoFlyZone)
    private readonly noFlyZoneRepository: Repository<NoFlyZone>,
  ) { }

  async create(createNoFlyZoneDto: CreateNoFlyZoneDto): Promise<NoFlyZone> {
    const noFlyZone = this.noFlyZoneRepository.create({
      name: createNoFlyZoneDto.name,
      zoneType: createNoFlyZoneDto.zoneType,
      geometry: createNoFlyZoneDto.geometry,
      description: createNoFlyZoneDto.description,
    });
    return await this.noFlyZoneRepository.save(noFlyZone);
  }

  async findAll(): Promise<NoFlyZone[]> {
    return await this.noFlyZoneRepository.find();
  }

  async findById(id: number): Promise<NoFlyZone> {
    const noFlyZone = await this.noFlyZoneRepository.findOne({
      where: { id },
    });
    if (!noFlyZone) {
      throw new NotFoundException('No-fly zone not found');
    }
    return noFlyZone;
  }

  async update(id: number, updateNoFlyZoneDto: UpdateNoFlyZoneDto): Promise<NoFlyZone> {
    const noFlyZone = await this.findById(id);

    if (updateNoFlyZoneDto.name !== undefined) {
      noFlyZone.name = updateNoFlyZoneDto.name;
    }
    if (updateNoFlyZoneDto.zoneType !== undefined) {
      noFlyZone.zoneType = updateNoFlyZoneDto.zoneType;
    }
    if (updateNoFlyZoneDto.geometry !== undefined) {
      noFlyZone.geometry = updateNoFlyZoneDto.geometry;
    }
    if (updateNoFlyZoneDto.description !== undefined) {
      noFlyZone.description = updateNoFlyZoneDto.description;
    }

    return await this.noFlyZoneRepository.save(noFlyZone);
  }

  async delete(id: number): Promise<void> {
    const noFlyZone = await this.findById(id);
    await this.noFlyZoneRepository.remove(noFlyZone);
  }
}

