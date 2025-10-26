import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Simulation } from '../entities/simulation.entity';

@Injectable()
export class SimulationRepository extends BaseRepository<Simulation> {
  protected relations = ['pilot', 'mission'];

  constructor(
    @InjectRepository(Simulation)
    private readonly simulationRepository: Repository<Simulation>,
  ) {
    super(simulationRepository);
  }

  async findByPilotId(pilotId: number): Promise<Simulation[]> {
    return await this.simulationRepository.find({
      where: { pilotId },
      order: { simStartTime: 'DESC' },
    });
  }

  async findByMissionId(missionId: number): Promise<Simulation[]> {
    return await this.simulationRepository.find({
      where: { missionId },
      order: { simStartTime: 'DESC' },
    });
  }
}
