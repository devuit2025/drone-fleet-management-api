import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { NoFlyZone } from '../entities/no-fly-zone.entity';

@Injectable()
export class NoFlyZoneRepository extends BaseRepository<NoFlyZone> {
  constructor(
    @InjectRepository(NoFlyZone)
    private readonly noFlyZoneRepository: Repository<NoFlyZone>,
  ) {
    super(noFlyZoneRepository);
  }
}
