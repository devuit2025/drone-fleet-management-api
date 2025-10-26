import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Mission, MissionStatus } from '../entities/mission.entity';

@Injectable()
export class MissionRepository extends BaseRepository<Mission> {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {
    super(missionRepository);
  }

  async findByStatus(status: MissionStatus): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { status },
      relations: ['pilot', 'drone'],
    });
  }

  async findByPilot(pilotId: number): Promise<Mission[]> {
    return await this.missionRepository.find({
      where: { pilotId },
      relations: ['pilot', 'drone'],
    });
  }
}
