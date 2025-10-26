import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Waypoint } from '../entities/waypoint.entity';

@Injectable()
export class FlightPathRepository extends BaseRepository<Waypoint> {
    constructor(
        @InjectRepository(Waypoint)
        private readonly flightPathRepository: Repository<Waypoint>,
    ) {
        super(flightPathRepository);
    }

    async findByFlightId(flightId: number): Promise<Waypoint[]> {
        return await this.flightPathRepository.find({
            where: { missionId: flightId },
            order: { seqNumber: 'ASC' },
        });
    }

    async addPathPoint(
        flightId: number,
        latitude: number,
        longitude: number,
        altitude: number,
        speed: number,
        batteryLevel: number,
    ): Promise<Waypoint> {
        const lastPoint = await this.flightPathRepository.findOne({
            where: { missionId: flightId },
            order: { seqNumber: 'DESC' },
        });

        const seqNumber = lastPoint ? lastPoint.seqNumber + 1 : 1;

        return await this.create({
            missionId: flightId,
            seqNumber,
            geoPoint: `POINT(${longitude} ${latitude})`,
            altitudeM: altitude,
            speedMps: speed,
            action: 'waypoint',
        });
    }

    async getLatestPathPoint(flightId: number): Promise<Waypoint | null> {
        return await this.flightPathRepository.findOne({
            where: { missionId: flightId },
            order: { seqNumber: 'DESC' },
        });
    }

    async deleteByFlightId(flightId: number): Promise<void> {
        await this.flightPathRepository.delete({ missionId: flightId });
    }
}
