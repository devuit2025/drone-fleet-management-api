import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telemetry } from '../../entities/telemetry.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';
import { CreateTelemetryDto, UpdateTelemetryDto } from './dto';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(Telemetry)
    private readonly telemetryRepository: Repository<Telemetry>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Drone)
    private readonly droneRepository: Repository<Drone>,
  ) { }

  async create(createTelemetryDto: CreateTelemetryDto): Promise<Telemetry> {
    // Validate mission and drone exist
    const mission = await this.missionRepository.findOne({
      where: { id: createTelemetryDto.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const drone = await this.droneRepository.findOne({
      where: { id: createTelemetryDto.droneId },
    });
    if (!drone) {
      throw new NotFoundException('Drone not found');
    }

    const telemetry = this.telemetryRepository.create({
      droneId: createTelemetryDto.droneId,
      missionId: createTelemetryDto.missionId,
      timestamp: new Date(createTelemetryDto.timestamp),
      location: createTelemetryDto.location,
      altitudeM: createTelemetryDto.altitudeM,
      speedMps: createTelemetryDto.speedMps,
      batteryPct: createTelemetryDto.batteryPct,
      status: createTelemetryDto.status,
      payloadWeight: createTelemetryDto.payloadWeight,
    });

    return await this.telemetryRepository.save(telemetry);
  }

  async findAll(): Promise<Telemetry[]> {
    return await this.telemetryRepository.find({
      relations: ['mission', 'drone'],
      order: { timestamp: 'DESC' },
    });
  }

  async findById(id: number): Promise<Telemetry> {
    const telemetry = await this.telemetryRepository.findOne({
      where: { id },
      relations: ['mission', 'drone'],
    });
    if (!telemetry) {
      throw new NotFoundException('Telemetry not found');
    }
    return telemetry;
  }

  async findByDrone(droneId: number): Promise<Telemetry[]> {
    return await this.telemetryRepository.find({
      where: { droneId },
      relations: ['mission', 'drone'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByMission(missionId: number): Promise<Telemetry[]> {
    return await this.telemetryRepository.find({
      where: { missionId },
      relations: ['mission', 'drone'],
      order: { timestamp: 'ASC' },
    });
  }

  async update(id: number, updateTelemetryDto: UpdateTelemetryDto): Promise<Telemetry> {
    const telemetry = await this.findById(id);

    if (updateTelemetryDto.droneId !== undefined) {
      telemetry.droneId = updateTelemetryDto.droneId;
    }
    if (updateTelemetryDto.missionId !== undefined) {
      telemetry.missionId = updateTelemetryDto.missionId;
    }
    if (updateTelemetryDto.timestamp !== undefined) {
      telemetry.timestamp = new Date(updateTelemetryDto.timestamp);
    }
    if (updateTelemetryDto.location !== undefined) {
      telemetry.location = updateTelemetryDto.location;
    }
    if (updateTelemetryDto.altitudeM !== undefined) {
      telemetry.altitudeM = updateTelemetryDto.altitudeM;
    }
    if (updateTelemetryDto.speedMps !== undefined) {
      telemetry.speedMps = updateTelemetryDto.speedMps;
    }
    if (updateTelemetryDto.batteryPct !== undefined) {
      telemetry.batteryPct = updateTelemetryDto.batteryPct;
    }
    if (updateTelemetryDto.status !== undefined) {
      telemetry.status = updateTelemetryDto.status;
    }
    if (updateTelemetryDto.payloadWeight !== undefined) {
      telemetry.payloadWeight = updateTelemetryDto.payloadWeight;
    }

    return await this.telemetryRepository.save(telemetry);
  }

  async delete(id: number): Promise<void> {
    const telemetry = await this.findById(id);
    await this.telemetryRepository.remove(telemetry);
  }
}

