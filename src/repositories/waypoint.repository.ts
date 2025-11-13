import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Waypoint } from '../entities/waypoint.entity';

@Injectable()
export class WaypointRepository extends BaseRepository<Waypoint> {
  protected relations = ['missionDrone'];

  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
  ) {
    super(waypointRepository);
  }

  async findByMissionDroneId(missionDroneId: number): Promise<Waypoint[]> {
    return await this.waypointRepository.find({
      where: { missionDroneId },
      order: { seqNumber: 'ASC' },
    });
  }

  async findByMissionId(missionId: number): Promise<Waypoint[]> {
    return await this.waypointRepository
      .createQueryBuilder('waypoint')
      .innerJoin('waypoint.missionDrone', 'missionDrone')
      .where('missionDrone.missionId = :missionId', { missionId })
      .orderBy('waypoint.seqNumber', 'ASC')
      .getMany();
  }
}
