import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionDrone } from '../../entities/mission-drone.entity';
import { Mission } from '../../entities/mission.entity';
import { Drone } from '../../entities/drone.entity';
import { CreateMissionDroneDto, UpdateMissionDroneDto } from './dto';

@Injectable()
export class MissionDronesService {
  constructor(
    @InjectRepository(MissionDrone)
    private readonly missionDroneRepository: Repository<MissionDrone>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Drone)
    private readonly droneRepository: Repository<Drone>,
  ) { }

  async create(createMissionDroneDto: CreateMissionDroneDto): Promise<MissionDrone> {
    // Check if mission exists
    const mission = await this.missionRepository.findOne({
      where: { id: createMissionDroneDto.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Check if drone exists
    const drone = await this.droneRepository.findOne({
      where: { id: createMissionDroneDto.droneId },
    });
    if (!drone) {
      throw new NotFoundException('Drone not found');
    }

    // Check if already assigned
    const existing = await this.missionDroneRepository.findOne({
      where: {
        missionId: createMissionDroneDto.missionId,
        droneId: createMissionDroneDto.droneId,
      },
    });
    if (existing) {
      throw new ConflictException('Drone is already assigned to this mission');
    }

    const missionDrone = this.missionDroneRepository.create(createMissionDroneDto);
    return await this.missionDroneRepository.save(missionDrone);
  }

  async findAll(): Promise<MissionDrone[]> {
    return await this.missionDroneRepository.find({
      relations: ['mission', 'drone'],
    });
  }

  async findById(id: number): Promise<MissionDrone> {
    const missionDrone = await this.missionDroneRepository.findOne({
      where: { id },
      relations: ['mission', 'drone'],
    });
    if (!missionDrone) {
      throw new NotFoundException('Mission-Drone assignment not found');
    }
    return missionDrone;
  }

  async findByMission(missionId: number): Promise<MissionDrone[]> {
    return await this.missionDroneRepository.find({
      where: { missionId },
      relations: ['mission', 'drone'],
    });
  }

  async findByDrone(droneId: number): Promise<MissionDrone[]> {
    return await this.missionDroneRepository.find({
      where: { droneId },
      relations: ['mission', 'drone'],
    });
  }

  async update(id: number, updateMissionDroneDto: UpdateMissionDroneDto): Promise<MissionDrone> {
    const missionDrone = await this.findById(id);

    if (updateMissionDroneDto.missionId !== undefined) {
      missionDrone.missionId = updateMissionDroneDto.missionId;
    }
    if (updateMissionDroneDto.droneId !== undefined) {
      missionDrone.droneId = updateMissionDroneDto.droneId;
    }

    return await this.missionDroneRepository.save(missionDrone);
  }

  async delete(id: number): Promise<void> {
    const missionDrone = await this.findById(id);
    await this.missionDroneRepository.remove(missionDrone);
  }

  async deleteByMissionAndDrone(missionId: number, droneId: number): Promise<void> {
    const missionDrone = await this.missionDroneRepository.findOne({
      where: { missionId, droneId },
    });
    if (!missionDrone) {
      throw new NotFoundException('Mission-Drone assignment not found');
    }
    await this.missionDroneRepository.remove(missionDrone);
  }
}

