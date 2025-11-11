import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { Waypoint } from '../../entities/waypoint.entity';
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

    private normalizeGeoPoint(input: any): { type: 'Point'; coordinates: [number, number] } {
        if (!input) {
            throw new BadRequestException('geoPoint is required');
        }
        if (typeof input === 'object' && input.type === 'Point' && Array.isArray(input.coordinates)) {
            return {
                type: 'Point',
                coordinates: [Number(input.coordinates[0]), Number(input.coordinates[1])] as [number, number],
            };
        }
        if (typeof input === 'string') {
            const match = input.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
            if (!match) {
                throw new BadRequestException('Invalid geoPoint format');
            }
            return {
                type: 'Point',
                coordinates: [Number(match[1]), Number(match[2])] as [number, number],
            };
        }
        throw new BadRequestException('Unsupported geoPoint format');
    }

    async create(createMissionDto: CreateMissionDto): Promise<Mission> {
        return await this.missionRepository.manager.transaction(async manager => {
            const mission = manager.create(Mission, {
                pilotId: createMissionDto.pilotId,
                licenseId:
                    createMissionDto.licenseId !== undefined ? createMissionDto.licenseId : null,
                missionName: createMissionDto.missionName,
                status: createMissionDto.status || MissionStatus.PLANNED,
                startTime: createMissionDto.startTime
                    ? new Date(createMissionDto.startTime)
                    : null,
                endTime: createMissionDto.endTime ? new Date(createMissionDto.endTime) : null,
            });

            const savedMission = await manager.save(mission);

            const waypointsInput = createMissionDto.waypoints ?? [];
            if (waypointsInput.length > 0) {
                const waypointRepo = manager.getRepository(Waypoint);
                const waypointEntities = waypointsInput.map(wp =>
                    waypointRepo.create({
                        missionId: savedMission.id,
                        seqNumber: Number(wp.seqNumber),
                        geoPoint: this.normalizeGeoPoint(wp.geoPoint),
                        altitudeM: Number(wp.altitudeM),
                        speedMps: Number(wp.speedMps),
                        action: wp.action,
                    } as DeepPartial<Waypoint>),
                );
                const savedWaypoints = await waypointRepo.save(waypointEntities);
                (savedMission as any).waypoints = savedWaypoints;
            } else {
                (savedMission as any).waypoints = [];
            }

            return savedMission;
        });
    }

    // Inherit findAll(per,page)

    // Inherit findById

    async update(id: number, updateMissionDto: Partial<Mission> & { waypoints?: any[] }): Promise<Mission> {
        return await this.missionRepository.manager.transaction(async manager => {
            const mission = await manager.findOne(Mission, {
                where: { id },
                relations: ['waypoints'],
            });

            if (!mission) {
                throw new NotFoundException('Mission not found');
            }

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

            const waypointRepo = manager.getRepository(Waypoint);
            if (Array.isArray(updateMissionDto.waypoints)) {
                await waypointRepo.delete({ missionId: mission.id });

                const waypointsInput = updateMissionDto.waypoints;
                if (waypointsInput.length > 0) {
                    const waypointEntities = waypointsInput.map(wp =>
                        waypointRepo.create({
                            missionId: mission.id,
                            seqNumber: Number(wp.seqNumber),
                            geoPoint: this.normalizeGeoPoint(wp.geoPoint),
                            altitudeM: Number(wp.altitudeM),
                            speedMps: Number(wp.speedMps),
                            action: wp.action,
                        } as DeepPartial<Waypoint>),
                    );
                    await waypointRepo.save(waypointEntities);
                }
            }

            // Update scalar fields without syncing relations by saving the entity instance
            await manager.update(Mission, { id: mission.id }, {
                status: mission.status,
                missionName: mission.missionName,
                startTime: mission.startTime,
                endTime: mission.endTime,
            } as Partial<Mission>);

            const refreshed = await manager.findOne(Mission, {
                where: { id: mission.id },
                relations: ['waypoints'],
            });

            return refreshed ?? mission;
        });
    }

    async delete(id: number): Promise<void> {
        await this.missionRepository.manager.transaction(async manager => {
            const exists = await manager.findOne(Mission, { where: { id } });
            if (!exists) {
                throw new NotFoundException('Mission not found');
            }
            await manager.getRepository(Waypoint).delete({ missionId: id });
            await manager.delete(Mission, { id });
        });
    }
}
