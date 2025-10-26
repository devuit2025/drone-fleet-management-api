import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { MissionDrone } from '../entities/mission-drone.entity';

@Injectable()
export class MissionDroneRepository extends BaseRepository<MissionDrone> {
  constructor(
    @InjectRepository(MissionDrone)
    private readonly missionDroneRepository: Repository<MissionDrone>,
  ) {
    super(missionDroneRepository);
  }

  async findByMissionId(missionId: number): Promise<MissionDrone[]> {
    return await this.missionDroneRepository.find({
      where: { missionId },
      relations: ['drone'],
    });
  }

  async findByDroneId(droneId: number): Promise<MissionDrone[]> {
    return await this.missionDroneRepository.find({
      where: { droneId },
      relations: ['mission'],
    });
  }
}
