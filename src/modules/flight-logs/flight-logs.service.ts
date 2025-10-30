import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightLog } from '../../entities/flight-log.entity';
import { Mission } from '../../entities/mission.entity';
import { CreateFlightLogDto, UpdateFlightLogDto } from './dto';
import { FlightLogRepository } from '../../repositories/flight-log.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class FlightLogsService extends BaseService<FlightLog> {
  constructor(
    @InjectRepository(FlightLog)
    private readonly flightLogRepository: Repository<FlightLog>,
    private readonly flightLogRepo: FlightLogRepository,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) { super(flightLogRepo, 'Flight log'); }

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

  // Inherit findAll(per,page)

  // Inherit findById

  async findByMission(missionId: number): Promise<FlightLog[]> {
    return await this.flightLogRepository.find({
      where: { missionId },
      relations: ['mission'],
      order: { timestamp: 'ASC' },
    });
  }

  async update(id: number, updateFlightLogDto: Partial<FlightLog>): Promise<FlightLog> {
    const flightLog = await this.findById(id);

    if (updateFlightLogDto.missionId !== undefined) {
      flightLog.missionId = updateFlightLogDto.missionId as any;
    }
    if (updateFlightLogDto.eventType !== undefined) {
      flightLog.eventType = updateFlightLogDto.eventType as any;
    }
    if (updateFlightLogDto.description !== undefined) {
      flightLog.description = updateFlightLogDto.description as any;
    }
    if ((updateFlightLogDto as any).timestamp !== undefined) {
      const ts = (updateFlightLogDto as any).timestamp;
      flightLog.timestamp = ts ? new Date(ts as any) : flightLog.timestamp;
    }

    return await this.flightLogRepository.save(flightLog);
  }

  // delete inherited
}

