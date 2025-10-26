import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Drone, DroneStatus } from '../entities/drone.entity';

@Injectable()
export class DroneRepository extends BaseRepository<Drone> {
    protected relations = ['model', 'sensors', 'telemetry'];

    constructor(
        @InjectRepository(Drone)
        private readonly droneRepository: Repository<Drone>,
    ) {
        super(droneRepository);
    }

    async findBySerialNumber(serialNumber: string): Promise<Drone | null> {
        return await this.droneRepository.findOne({
            where: { serialNumber: serialNumber },
        });
    }

    async findByStatus(status: DroneStatus): Promise<Drone[]> {
        return await this.droneRepository.find({
            where: { status },
        });
    }

    async findActiveDrones(): Promise<Drone[]> {
        return await this.droneRepository.find({
            where: { status: DroneStatus.AVAILABLE },
        });
    }

    async findAvailableDrones(): Promise<Drone[]> {
        return await this.droneRepository.find({
            where: {
                status: DroneStatus.AVAILABLE,
            },
        });
    }

    async updateBatteryHealth(id: number, batteryHealth: number): Promise<void> {
        await this.droneRepository.update(id, {
            batteryHealth,
        });
    }

    async updateStatus(id: number, status: DroneStatus): Promise<void> {
        await this.droneRepository.update(id, {
            status,
        });
    }
}
