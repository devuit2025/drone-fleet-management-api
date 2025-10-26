import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { MissionReport } from '../entities/mission-report.entity';

@Injectable()
export class MissionReportRepository extends BaseRepository<MissionReport> {
  constructor(
    @InjectRepository(MissionReport)
    private readonly missionReportRepository: Repository<MissionReport>,
  ) {
    super(missionReportRepository);
  }

  async findByMissionId(missionId: number): Promise<MissionReport[]> {
    return await this.missionReportRepository.find({
      where: { missionId },
      order: { createdAt: 'DESC' },
    });
  }
}
