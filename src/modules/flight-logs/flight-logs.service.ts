import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightLog } from '../../entities/flight-log.entity';
import { Mission } from '../../entities/mission.entity';
import { CreateFlightLogDto, UpdateFlightLogDto } from './dto';

@Injectable()
export class FlightLogsService {
  constructor(
    @InjectRepository(FlightLog)
    private readonly flightLogRepository: Repository<FlightLog>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) { }

  async create(createFlightLogDto: CreateFlightLogDto): Promise<FlightLog> {
    // Validate mission exists
    const mission = await this.missionRepository.findOne({
      where: { id: createFlightLogDto.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const flightLog = this.flightLogRepository.create({
      missionId: createFlightLogDto.missionId,
      eventType: createFlightLogDto.eventType,
      description: createFlightLogDto.description,
      timestamp: new Date(createFlightLogDto.timestamp),
    });

    return await this.flightLogRepository.save(flightLog);
  }

  async findAll(): Promise<FlightLog[]> {
    return await this.flightLogRepository.find({
      relations: ['mission'],
      order: { timestamp: 'DESC' },
    });
  }

  async findById(id: number): Promise<FlightLog> {
    const flightLog = await this.flightLogRepository.findOne({
      where: { id },
      relations: ['mission'],
    });
    if (!flightLog) {
      throw new NotFoundException('Flight log not found');
    }
    return flightLog;
  }

  async findByMission(missionId: number): Promise<FlightLog[]> {
    return await this.flightLogRepository.find({
      where: { missionId },
      relations: ['mission'],
      order: { timestamp: 'ASC' },
    });
  }

  async update(id: number, updateFlightLogDto: UpdateFlightLogDto): Promise<FlightLog> {
    const flightLog = await this.findById(id);

    if (updateFlightLogDto.missionId !== undefined) {
      flightLog.missionId = updateFlightLogDto.missionId;
    }
    if (updateFlightLogDto.eventType !== undefined) {
      flightLog.eventType = updateFlightLogDto.eventType;
    }
    if (updateFlightLogDto.description !== undefined) {
      flightLog.description = updateFlightLogDto.description;
    }
    if (updateFlightLogDto.timestamp !== undefined) {
      flightLog.timestamp = new Date(updateFlightLogDto.timestamp);
    }

    return await this.flightLogRepository.save(flightLog);
  }

  async delete(id: number): Promise<void> {
    const flightLog = await this.findById(id);
    await this.flightLogRepository.remove(flightLog);
  }
}

