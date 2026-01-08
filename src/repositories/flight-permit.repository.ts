import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { FlightPermit } from '../entities/flight-permit.entity';

@Injectable()
export class FlightPermitRepository extends BaseRepository<FlightPermit> {
  protected relations = ['license'];

  constructor(
    @InjectRepository(FlightPermit)
    private readonly flightPermitRepository: Repository<FlightPermit>,
  ) {
    super(flightPermitRepository);
  }

  async findByLicenseId(licenseId: number): Promise<FlightPermit[]> {
    return await this.flightPermitRepository.find({
      where: { licenseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByLicenseId(licenseId: number): Promise<FlightPermit | null> {
    return await this.flightPermitRepository.findOne({
      where: {
        licenseId,
        status: 'approved' as any,
      },
      order: { expiryDate: 'DESC' },
    });
  }
}



