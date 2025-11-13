import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';
import { CreateNoFlyZoneDto, UpdateNoFlyZoneDto } from './dto';
import { NoFlyZoneRepository } from '../../repositories/no-fly-zone.repository';
import { BaseService } from '../../common/base.service';
import { GeometryParseError, normalizeGeometryObject } from '../../utils/geometry';

@Injectable()
export class NoFlyZonesService extends BaseService<NoFlyZone> {
  constructor(
    @InjectRepository(NoFlyZone)
    private readonly noFlyZoneRepository: Repository<NoFlyZone>,
    private readonly noFlyZoneRepo: NoFlyZoneRepository,
  ) { super(noFlyZoneRepo, 'No-fly zone'); }

  async create(createNoFlyZoneDto: CreateNoFlyZoneDto): Promise<NoFlyZone> {
    const geometryValue = this.normalizeGeometryOrThrow(createNoFlyZoneDto.geometry);
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
      noFlyZone.geometry = this.normalizeGeometryOrThrow(updateNoFlyZoneDto.geometry);
    }
    if (updateNoFlyZoneDto.description !== undefined) {
      noFlyZone.description = updateNoFlyZoneDto.description;
    }

    return await this.noFlyZoneRepository.save(noFlyZone);
  }

  // delete inherited

  private normalizeGeometryOrThrow(input: any): any {
    try {
      return normalizeGeometryObject(input);
    } catch (error) {
      if (error instanceof GeometryParseError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

