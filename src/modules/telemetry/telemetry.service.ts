import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telemetry } from '../../entities/telemetry.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';
import { CreateTelemetryDto, UpdateTelemetryDto } from './dto';
import { TelemetryRepository } from '../../repositories/telemetry.repository';

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(Telemetry)
    private readonly telemetryRepository: Repository<Telemetry>,
    private readonly telemetryRepo: TelemetryRepository,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Drone)
    private readonly droneRepository: Repository<Drone>,
  ) { }

  async create(createTelemetryDto: CreateTelemetryDto): Promise<Telemetry> {
    // Use raw query for PostGIS geometry
    const result = await this.telemetryRepository.query(`
      INSERT INTO telemetry (drone_id, mission_id, timestamp, location, altitude_m, speed_mps, battery_pct, status, payload_weight)
      VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      createTelemetryDto.droneId,
      createTelemetryDto.missionId,
      new Date(createTelemetryDto.timestamp).toISOString(),
      createTelemetryDto.location,
      createTelemetryDto.altitudeM,
      createTelemetryDto.speedMps,
      createTelemetryDto.batteryPct,
      createTelemetryDto.status,
      createTelemetryDto.payloadWeight,
    ]);

    return result[0] as Telemetry;
  }

  async findAll(): Promise<Telemetry[]> {
    return await this.telemetryRepo.findAll({
      relations: ['mission', 'drone'],
      sort: '-timestamp',
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
    return await this.telemetryRepo.findByDroneId(droneId);
  }

  async findByMission(missionId: number): Promise<Telemetry[]> {
    return await this.telemetryRepo.findByMissionId(missionId);
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

