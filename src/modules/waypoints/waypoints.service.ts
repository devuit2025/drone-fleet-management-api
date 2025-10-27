import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waypoint } from '../../entities/waypoint.entity';
import { CreateWaypointDto, UpdateWaypointDto } from './dto';
import { WaypointRepository } from '../../repositories/waypoint.repository';

@Injectable()
export class WaypointsService {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
    private readonly waypointRepo: WaypointRepository,
  ) { }

  async create(createWaypointDto: CreateWaypointDto): Promise<Waypoint> {
    // Use raw query for PostGIS geometry
    const result = await this.waypointRepository.query(`
      INSERT INTO waypoints (mission_id, seq_number, geo_point, altitude_m, speed_mps, action, created_at)
      VALUES ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6, NOW())
      RETURNING *
    `, [
      createWaypointDto.missionId,
      createWaypointDto.seqNumber,
      createWaypointDto.geoPoint,
      createWaypointDto.altitudeM,
      createWaypointDto.speedMps,
      createWaypointDto.action,
    ]);

    return result[0] as Waypoint;
  }

  async findAll(): Promise<Waypoint[]> {
    return await this.waypointRepo.findAll({
      sort: 'missionId,seqNumber',
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
    return await this.waypointRepo.findByMissionId(missionId);
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

