import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { CreateMissionDto, UpdateMissionDto } from './dto';

@Injectable()
export class MissionsService {
    constructor(
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
    ) { }

    async create(createMissionDto: CreateMissionDto): Promise<Mission> {
        const mission = this.missionRepository.create({
            pilotId: createMissionDto.pilotId,
            licenseId: createMissionDto.licenseId,
            missionName: createMissionDto.missionName,
            status: createMissionDto.status || MissionStatus.PLANNED,
            startTime: createMissionDto.startTime ? new Date(createMissionDto.startTime) : null,
            endTime: createMissionDto.endTime ? new Date(createMissionDto.endTime) : null,
        });
        return await this.missionRepository.save(mission);
    }

    async findAll(): Promise<Mission[]> {
        return await this.missionRepository.find();
    }

    async findById(id: number): Promise<Mission> {
        const mission = await this.missionRepository.findOne({
            where: { id },
        });
        if (!mission) {
            throw new NotFoundException('Mission not found');
        }
        return mission;
    }

    async update(id: number, updateMissionDto: UpdateMissionDto): Promise<Mission> {
        const mission = await this.findById(id);

        if (updateMissionDto.status) {
            mission.status = updateMissionDto.status;
        }
        if (updateMissionDto.missionName) {
            mission.missionName = updateMissionDto.missionName;
        }
        if (updateMissionDto.startTime !== undefined) {
            mission.startTime = updateMissionDto.startTime ? new Date(updateMissionDto.startTime) : null;
        }
        if (updateMissionDto.endTime !== undefined) {
            mission.endTime = updateMissionDto.endTime ? new Date(updateMissionDto.endTime) : null;
        }

        return await this.missionRepository.save(mission);
    }

    async delete(id: number): Promise<void> {
        const mission = await this.findById(id);
        await this.missionRepository.remove(mission);
    }
}
