import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Mission, MissionStatus } from '../entities/mission.entity';

@Injectable()
export class FlightRepository extends BaseRepository<Mission> {
  constructor(
    @InjectRepository(Mission)
    private readonly flightRepository: Repository<Mission>,
  ) {
    super(flightRepository);
  }

  async findByStatus(status: MissionStatus): Promise<Mission[]> {
    return await this.flightRepository.find({
      where: { status },
      relations: ['pilot', 'drone'],
    });
  }

  async findByPilot(pilotId: number): Promise<Mission[]> {
    return await this.flightRepository.find({
      where: { pilot_id: pilotId },
      relations: ['pilot', 'drone'],
    });
  }

  async findByDrone(droneId: number): Promise<Mission[]> {
    return await this.flightRepository.find({
      where: { license_id: droneId },
      relations: ['pilot', 'drone'],
    });
  }

  async findActiveFlights(): Promise<Mission[]> {
    return await this.flightRepository.find({
      where: { status: MissionStatus.IN_PROGRESS },
      relations: ['pilot', 'drone'],
    });
  }

  async findFlightsByDateRange(startDate: Date, endDate: Date): Promise<Mission[]> {
    return await this.flightRepository
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.pilot', 'pilot')
      .leftJoinAndSelect('flight.drone', 'drone')
      .where('flight.start_time BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('flight.start_time', 'ASC')
      .getMany();
  }

  async updateStatus(id: number, status: MissionStatus): Promise<void> {
    await this.flightRepository.update(id, { status });
  }

  async startFlight(id: number): Promise<void> {
    await this.flightRepository.update(id, {
      status: MissionStatus.IN_PROGRESS,
      start_time: new Date(),
    });
  }

  async endFlight(id: number, endLatitude: number, endLongitude: number, endAltitude: number): Promise<void> {
    const flight = await this.findById(id);
    if (flight && flight.start_time) {
      await this.flightRepository.update(id, {
        status: MissionStatus.COMPLETED,
        end_time: new Date(),
      });
    }
  }
}
