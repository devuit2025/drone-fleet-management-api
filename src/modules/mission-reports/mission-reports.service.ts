import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionReport } from '../../entities/mission-report.entity';
import { Mission } from '../../entities/mission.entity';
import { CreateMissionReportDto, UpdateMissionReportDto } from './dto';
import { MissionReportRepository } from '../../repositories/mission-report.repository';

@Injectable()
export class MissionReportsService {
  constructor(
    @InjectRepository(MissionReport)
    private readonly missionReportRepository: Repository<MissionReport>,
    private readonly missionReportRepo: MissionReportRepository,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) { }

  async create(createMissionReportDto: CreateMissionReportDto): Promise<MissionReport> {
    // Validate mission exists
    const mission = await this.missionRepository.findOne({
      where: { id: createMissionReportDto.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const missionReport = this.missionReportRepository.create(createMissionReportDto);
    return await this.missionReportRepository.save(missionReport);
  }

  async findAll(): Promise<MissionReport[]> {
    return await this.missionReportRepo.findAll({
      relations: ['mission'],
      sort: '-createdAt',
    });
  }

  async findById(id: number): Promise<MissionReport> {
    const missionReport = await this.missionReportRepository.findOne({
      where: { id },
      relations: ['mission'],
    });
    if (!missionReport) {
      throw new NotFoundException('Mission report not found');
    }
    return missionReport;
  }

  async findByMission(missionId: number): Promise<MissionReport[]> {
    return await this.missionReportRepository.find({
      where: { missionId },
      relations: ['mission'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateMissionReportDto: UpdateMissionReportDto): Promise<MissionReport> {
    const missionReport = await this.findById(id);

    if (updateMissionReportDto.missionId !== undefined) {
      missionReport.missionId = updateMissionReportDto.missionId;
    }
    if (updateMissionReportDto.flightTimeSec !== undefined) {
      missionReport.flightTimeSec = updateMissionReportDto.flightTimeSec;
    }
    if (updateMissionReportDto.distanceM !== undefined) {
      missionReport.distanceM = updateMissionReportDto.distanceM;
    }
    if (updateMissionReportDto.avgSpeedMps !== undefined) {
      missionReport.avgSpeedMps = updateMissionReportDto.avgSpeedMps;
    }
    if (updateMissionReportDto.batteryConsumedPct !== undefined) {
      missionReport.batteryConsumedPct = updateMissionReportDto.batteryConsumedPct;
    }
    if (updateMissionReportDto.incidentCount !== undefined) {
      missionReport.incidentCount = updateMissionReportDto.incidentCount;
    }

    return await this.missionReportRepository.save(missionReport);
  }

  async delete(id: number): Promise<void> {
    const missionReport = await this.findById(id);
    await this.missionReportRepository.remove(missionReport);
  }
}

