import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { FlightLog } from '../entities/flight-log.entity';

@Injectable()
export class FlightLogRepository extends BaseRepository<FlightLog> {
  constructor(
    @InjectRepository(FlightLog)
    private readonly flightLogRepository: Repository<FlightLog>,
  ) {
    super(flightLogRepository);
  }

  async findByMissionId(missionId: number): Promise<FlightLog[]> {
    return await this.flightLogRepository.find({
      where: { missionId },
      order: { timestamp: 'ASC' },
    });
  }
}
