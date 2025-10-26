import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Waypoint } from '../entities/waypoint.entity';

@Injectable()
export class WaypointRepository extends BaseRepository<Waypoint> {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
  ) {
    super(waypointRepository);
  }

  async findByMissionId(missionId: number): Promise<Waypoint[]> {
    return await this.waypointRepository.find({
      where: { missionId },
      order: { seqNumber: 'ASC' },
    });
  }
}
