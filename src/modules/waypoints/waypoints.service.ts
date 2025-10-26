import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waypoint } from '../../entities/waypoint.entity';
import { CreateWaypointDto, UpdateWaypointDto } from './dto';

@Injectable()
export class WaypointsService {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
  ) { }

  async create(createWaypointDto: CreateWaypointDto): Promise<Waypoint> {
    const waypoint = this.waypointRepository.create({
      missionId: createWaypointDto.missionId,
      seqNumber: createWaypointDto.seqNumber,
      geoPoint: createWaypointDto.geoPoint,
      altitudeM: createWaypointDto.altitudeM,
      speedMps: createWaypointDto.speedMps,
      action: createWaypointDto.action,
    });
    return await this.waypointRepository.save(waypoint);
  }

  async findAll(): Promise<Waypoint[]> {
    return await this.waypointRepository.find({
      order: { missionId: 'ASC', seqNumber: 'ASC' },
    });
  }

  async findById(id: number): Promise<Waypoint> {
    const waypoint = await this.waypointRepository.findOne({
      where: { id },
    });
    if (!waypoint) {
      throw new NotFoundException('Waypoint not found');
    }
    return waypoint;
  }

  async findByMissionId(missionId: number): Promise<Waypoint[]> {
    return await this.waypointRepository.find({
      where: { missionId },
      order: { seqNumber: 'ASC' },
    });
  }

  async update(id: number, updateWaypointDto: UpdateWaypointDto): Promise<Waypoint> {
    const waypoint = await this.findById(id);

    if (updateWaypointDto.missionId !== undefined) {
      waypoint.missionId = updateWaypointDto.missionId;
    }
    if (updateWaypointDto.seqNumber !== undefined) {
      waypoint.seqNumber = updateWaypointDto.seqNumber;
    }
    if (updateWaypointDto.geoPoint !== undefined) {
      waypoint.geoPoint = updateWaypointDto.geoPoint;
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

  async delete(id: number): Promise<void> {
    const waypoint = await this.findById(id);
    await this.waypointRepository.remove(waypoint);
  }
}

