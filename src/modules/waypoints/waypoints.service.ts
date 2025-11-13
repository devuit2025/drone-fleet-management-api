import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waypoint } from '../../entities/waypoint.entity';
import { CreateWaypointDto, UpdateWaypointDto } from './dto';
import { WaypointRepository } from '../../repositories/waypoint.repository';
import { BaseService } from '../../common/base.service';
import { GeometryParseError, normalizePointGeometry } from '../../utils/geometry';

@Injectable()
export class WaypointsService extends BaseService<Waypoint> {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
    private readonly waypointRepo: WaypointRepository,
  ) { super(waypointRepo, 'Waypoint'); }

  async create(createWaypointDto: CreateWaypointDto): Promise<Waypoint> {
    const geoPoint = this.normalizeGeoPointOrThrow(createWaypointDto.geoPoint);

    const waypoint = this.waypointRepository.create({
      missionDroneId: createWaypointDto.missionDroneId,
      seqNumber: createWaypointDto.seqNumber,
      geoPoint,
      altitudeM: createWaypointDto.altitudeM,
      speedMps: createWaypointDto.speedMps,
      action: createWaypointDto.action,
    });

    return await this.waypointRepository.save(waypoint);
  }

  // Inherit findAll(per,page)

  // Inherit findById

  async findByMissionDroneId(missionDroneId: number): Promise<Waypoint[]> {
    return await this.waypointRepo.findByMissionDroneId(missionDroneId);
  }

  async findByMissionId(missionId: number): Promise<Waypoint[]> {
    return await this.waypointRepo.findByMissionId(missionId);
  }

  async update(id: number, updateWaypointDto: UpdateWaypointDto): Promise<Waypoint> {
    const waypoint = await this.findById(id);

    if (updateWaypointDto.missionDroneId !== undefined) {
      waypoint.missionDroneId = updateWaypointDto.missionDroneId;
    }
    if (updateWaypointDto.seqNumber !== undefined) {
      waypoint.seqNumber = updateWaypointDto.seqNumber;
    }
    if (updateWaypointDto.geoPoint !== undefined) {
      waypoint.geoPoint = this.normalizeGeoPointOrThrow(updateWaypointDto.geoPoint);
    }
    if (updateWaypointDto.altitudeM !== undefined) {
      waypoint.altitudeM = updateWaypointDto.altitudeM;
    }
    if (updateWaypointDto.speedMps !== undefined) {
      waypoint.speedMps = updateWaypointDto.speedMps;
    }
    if (updateWaypointDto.action !== undefined) {
      waypoint.action = updateWaypointDto.action;
    }

    return await this.waypointRepository.save(waypoint);
  }

  // delete inherited

  private normalizeGeoPointOrThrow(input: any): { type: 'Point'; coordinates: [number, number] } {
    try {
      return normalizePointGeometry(input);
    } catch (error) {
      if (error instanceof GeometryParseError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

