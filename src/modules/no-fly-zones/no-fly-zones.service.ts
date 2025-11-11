import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';
import { CreateNoFlyZoneDto, UpdateNoFlyZoneDto } from './dto';
import { NoFlyZoneRepository } from '../../repositories/no-fly-zone.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class NoFlyZonesService extends BaseService<NoFlyZone> {
  constructor(
    @InjectRepository(NoFlyZone)
    private readonly noFlyZoneRepository: Repository<NoFlyZone>,
    private readonly noFlyZoneRepo: NoFlyZoneRepository,
  ) { super(noFlyZoneRepo, 'No-fly zone'); }

  async create(createNoFlyZoneDto: CreateNoFlyZoneDto): Promise<NoFlyZone> {
    let geometryValue: any = createNoFlyZoneDto.geometry;
    if (typeof createNoFlyZoneDto.geometry === 'string') {
      try {
        geometryValue = JSON.parse(createNoFlyZoneDto.geometry);
      } catch (err) {
        throw new Error('Invalid geometry JSON');
      }
    }
    const noFlyZone = this.noFlyZoneRepository.create({
      name: createNoFlyZoneDto.name,
      zoneType: createNoFlyZoneDto.zoneType,
      geometry: geometryValue,
      description: createNoFlyZoneDto.description,
    });
    return await this.noFlyZoneRepository.save(noFlyZone);
  }

  // Inherit findAll(per,page)

  // Inherit findById

  async update(id: number, updateNoFlyZoneDto: UpdateNoFlyZoneDto): Promise<NoFlyZone> {
    const noFlyZone = await this.findById(id);

    if (updateNoFlyZoneDto.name !== undefined) {
      noFlyZone.name = updateNoFlyZoneDto.name;
    }
    if (updateNoFlyZoneDto.zoneType !== undefined) {
      noFlyZone.zoneType = updateNoFlyZoneDto.zoneType;
    }
    if (updateNoFlyZoneDto.geometry !== undefined) {
      if (typeof updateNoFlyZoneDto.geometry === 'string') {
        try {
          noFlyZone.geometry = JSON.parse(updateNoFlyZoneDto.geometry);
        } catch (err) {
          throw new Error('Invalid geometry JSON');
        }
      } else {
        noFlyZone.geometry = updateNoFlyZoneDto.geometry as any;
      }
    }
    if (updateNoFlyZoneDto.description !== undefined) {
      noFlyZone.description = updateNoFlyZoneDto.description;
    }

    return await this.noFlyZoneRepository.save(noFlyZone);
  }

  // delete inherited
}

