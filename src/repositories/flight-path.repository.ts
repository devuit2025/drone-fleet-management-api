import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Waypoint } from '../entities/waypoint.entity';

@Injectable()
export class FlightPathRepository extends BaseRepository<Waypoint> {
  constructor(
    @InjectRepository(Waypoint)
    private readonly flightPathRepository: Repository<Waypoint>,
  ) {
    super(flightPathRepository);
  }

  async findByFlightId(flightId: number): Promise<Waypoint[]> {
    return await this.flightPathRepository.find({
      where: { mission_id: flightId },
      order: { seq_number: 'ASC' },
    });
  }

  async addPathPoint(
    flightId: number,
    latitude: number,
    longitude: number,
    altitude: number,
    speed: number,
    batteryLevel: number,
  ): Promise<Waypoint> {
    const lastPoint = await this.flightPathRepository.findOne({
      where: { mission_id: flightId },
      order: { seq_number: 'DESC' },
    });

    const seq_number = lastPoint ? lastPoint.seq_number + 1 : 1;

    return await this.create({
      mission_id: flightId,
      seq_number,
      geo_point: `POINT(${longitude} ${latitude})`,
      altitude_m: altitude,
      speed_mps: speed,
      action: 'waypoint',
    });
  }

  async getLatestPathPoint(flightId: number): Promise<Waypoint | null> {
    return await this.flightPathRepository.findOne({
      where: { mission_id: flightId },
      order: { seq_number: 'DESC' },
    });
  }

  async deleteByFlightId(flightId: number): Promise<void> {
    await this.flightPathRepository.delete({ mission_id: flightId });
  }
}
