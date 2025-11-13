import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { MissionDrone } from '../../entities/mission-drone.entity';
import { Waypoint } from '../../entities/waypoint.entity';
import { CreateMissionDto, UpdateMissionDto } from './dto';
import { MissionRepository } from '../../repositories/mission.repository';
import { BaseService } from '../../common/base.service';
import { GeometryParseError, normalizePointGeometry } from '../../utils/geometry';

@Injectable()
export class MissionsService extends BaseService<Mission> {
    constructor(
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        private readonly missionRepo: MissionRepository,
    ) { super(missionRepo, 'Mission'); }

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

            const missionDroneRepo = manager.getRepository(MissionDrone);
            const waypointRepo = manager.getRepository(Waypoint);

            const dronesInput = createMissionDto.drones ?? [];
            const missionDrones: MissionDrone[] = [];

            for (const droneInput of dronesInput) {
                const missionDrone = missionDroneRepo.create({
                    missionId: savedMission.id,
                    droneId: droneInput.droneId,
                } as DeepPartial<MissionDrone>);
                const savedMissionDrone = await missionDroneRepo.save(missionDrone);

                const waypointsInput = droneInput.waypoints ?? [];
                if (waypointsInput.length > 0) {
                    const waypointEntities = waypointsInput.map(wp =>
                        waypointRepo.create({
                            missionDroneId: savedMissionDrone.id,
                            seqNumber: Number(wp.seqNumber),
                            geoPoint: this.normalizeGeoPointOrThrow(wp.geoPoint),
                            altitudeM: Number(wp.altitudeM),
                            speedMps: Number(wp.speedMps),
                            action: wp.action,
                        } as DeepPartial<Waypoint>),
                    );
                    const savedWaypoints = await waypointRepo.save(waypointEntities);
                    savedMissionDrone.waypoints = savedWaypoints;
                } else {
                    savedMissionDrone.waypoints = [];
                }

                missionDrones.push(savedMissionDrone);
            }

            (savedMission as any).missionDrones = missionDrones;

            const fullMission = await manager.findOne(Mission, {
                where: { id: savedMission.id },
                relations: ['missionDrones', 'missionDrones.drone', 'missionDrones.waypoints', 'pilot'],
            });

            return fullMission ?? savedMission;
        });
    }

    // Inherit findAll(per,page)

    // Inherit findById

    async update(id: number, updateMissionDto: Partial<Mission> & { drones?: any[] }): Promise<Mission> {
        return await this.missionRepository.manager.transaction(async manager => {
            const mission = await manager.findOne(Mission, {
                where: { id },
                relations: ['missionDrones', 'missionDrones.waypoints'],
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

            const missionDroneRepo = manager.getRepository(MissionDrone);
            const waypointRepo = manager.getRepository(Waypoint);

            // Update drones and waypoints if provided
            if (Array.isArray((updateMissionDto as any).drones)) {
                // Delete existing mission drones and their waypoints
                if (mission.missionDrones) {
                    for (const missionDrone of mission.missionDrones) {
                        await waypointRepo.delete({ missionDroneId: missionDrone.id });
                    }
                    await missionDroneRepo.delete({ missionId: mission.id });
                }

                // Create new mission drones and waypoints
                const dronesInput = (updateMissionDto as any).drones;
                for (const droneInput of dronesInput) {
                    const missionDrone = missionDroneRepo.create({
                        missionId: mission.id,
                        droneId: droneInput.droneId,
                    } as DeepPartial<MissionDrone>);
                    const savedMissionDrone = await missionDroneRepo.save(missionDrone);

                    const waypointsInput = droneInput.waypoints ?? [];
                    if (waypointsInput.length > 0) {
                        const waypointEntities = waypointsInput.map(wp =>
                            waypointRepo.create({
                                missionDroneId: savedMissionDrone.id,
                                seqNumber: Number(wp.seqNumber),
                                geoPoint: this.normalizeGeoPointOrThrow(wp.geoPoint),
                                altitudeM: Number(wp.altitudeM),
                                speedMps: Number(wp.speedMps),
                                action: wp.action,
                            } as DeepPartial<Waypoint>),
                        );
                        const savedWaypoints = await waypointRepo.save(waypointEntities);
                        savedMissionDrone.waypoints = savedWaypoints;
                    } else {
                        savedMissionDrone.waypoints = [];
                    }
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
                relations: ['missionDrones', 'missionDrones.drone', 'missionDrones.waypoints'],
            });

            return refreshed ?? mission;
        });
    }

    async delete(id: number): Promise<void> {
        await this.missionRepository.manager.transaction(async manager => {
            const exists = await manager.findOne(Mission, {
                where: { id },
                relations: ['missionDrones'],
            });
            if (!exists) {
                throw new NotFoundException('Mission not found');
            }

            const waypointRepo = manager.getRepository(Waypoint);
            const missionDroneRepo = manager.getRepository(MissionDrone);

            // Delete waypoints for all mission drones
            if (exists.missionDrones) {
                for (const missionDrone of exists.missionDrones) {
                    await waypointRepo.delete({ missionDroneId: missionDrone.id });
                }
            }

            // Delete mission drones
            await missionDroneRepo.delete({ missionId: id });

            // Delete mission
            await manager.delete(Mission, { id });
        });
    }

    private normalizeGeoPointOrThrow(input: any): { type: 'Point'; coordinates: [number, number] } {
        try {
            return normalizePointGeometry(input);
        } catch (error) {
            if (error instanceof GeometryParseError) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
