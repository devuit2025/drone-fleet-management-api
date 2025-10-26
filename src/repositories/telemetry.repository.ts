import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Telemetry } from '../entities/telemetry.entity';

@Injectable()
export class TelemetryRepository extends BaseRepository<Telemetry> {
  constructor(
    @InjectRepository(Telemetry)
    private readonly telemetryRepository: Repository<Telemetry>,
  ) {
    super(telemetryRepository);
  }

  async findByDroneId(droneId: number): Promise<Telemetry[]> {
    return await this.telemetryRepository.find({
      where: { droneId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByMissionId(missionId: number): Promise<Telemetry[]> {
    return await this.telemetryRepository.find({
      where: { missionId },
      order: { timestamp: 'ASC' },
    });
  }
}
