import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { CreateMissionDto, UpdateMissionDto } from './dto';
import { MissionRepository } from '../../repositories/mission.repository';
import { BaseService } from '../../common/base.service';

@Injectable()
export class MissionsService extends BaseService<Mission> {
    constructor(
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        private readonly missionRepo: MissionRepository,
    ) { super(missionRepo, 'Mission'); }

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

    // Inherit findAll(per,page)

    // Inherit findById

    async update(id: number, updateMissionDto: Partial<Mission>): Promise<Mission> {
        const mission = await this.findById(id);

        if (updateMissionDto.status !== undefined) {
            mission.status = updateMissionDto.status as any;
        }
        if (updateMissionDto.missionName !== undefined) {
            mission.missionName = updateMissionDto.missionName as string;
        }
        if ((updateMissionDto as any).startTime !== undefined) {
            const start = (updateMissionDto as any).startTime;
            mission.startTime = start ? new Date(start as any) : null;
        }
        if ((updateMissionDto as any).endTime !== undefined) {
            const end = (updateMissionDto as any).endTime;
            mission.endTime = end ? new Date(end as any) : null;
        }

        return await this.missionRepository.save(mission);
    }

    // delete inherited
}
