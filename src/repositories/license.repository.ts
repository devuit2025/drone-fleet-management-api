import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { License } from '../entities/license.entity';

@Injectable()
export class LicenseRepository extends BaseRepository<License> {
  protected relations = ['pilot'];

  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
  ) {
    super(licenseRepository);
  }
}
