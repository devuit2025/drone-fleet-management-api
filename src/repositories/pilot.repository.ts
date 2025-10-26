import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Pilot } from '../entities/pilot.entity';

@Injectable()
export class PilotRepository extends BaseRepository<Pilot> {
  protected relations = ['user', 'licenses'];

  constructor(
    @InjectRepository(Pilot)
    private readonly pilotRepository: Repository<Pilot>,
  ) {
    super(pilotRepository);
  }
}
