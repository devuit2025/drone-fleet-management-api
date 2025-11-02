import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DroneRepository } from '../../repositories/drone.repository';
import { Drone, DroneStatus } from '../../entities/drone.entity';
import { CreateDroneDto, UpdateDroneDto, UpdateLocationDto, UpdateStatusDto } from './dto';
import { BaseService } from '../../common/base.service';
const droneEntity = require("../../entities/drone.entity");

@Injectable()
export class DronesService extends BaseService<Drone> {
    constructor(private readonly droneRepository: DroneRepository) {
        super(droneRepository, 'Drone');
    }

    async create(createDroneDto: CreateDroneDto): Promise<Drone> {
        const existingDrone = await this.droneRepository.findBySerialNumber(
            createDroneDto.serialNumber,
        );
        if (existingDrone) {
            throw new ConflictException('Drone with this serial number already exists');
        }

        const droneData = {
            modelId: createDroneDto.modelId,
            name: createDroneDto.name,
            serialNumber: createDroneDto.serialNumber,
            status: createDroneDto.status || DroneStatus.AVAILABLE,
            firmwareVersion: createDroneDto.firmwareVersion,
            batteryHealth: createDroneDto.batteryHealth,
            totalFlightHours: createDroneDto.totalFlightHours || 0,
            lastMaintenance: createDroneDto.lastMaintenance,
        };

        return await this.droneRepository.create(droneData);
    }

    // Inherit findAll(per,page), findById, update, delete from BaseService

    // findById inherited (throws NotFoundException with resource name)

    async findBySerialNumber(serialNumber: string): Promise<Drone> {
        const drone = await this.droneRepository.findBySerialNumber(serialNumber);
        if (!drone) {
            throw new NotFoundException('Drone not found');
        }
        return drone;
    }

    async update(id: number, updateDroneDto: UpdateDroneDto): Promise<Drone> {
        const drone = await this.findById(id);
        if (updateDroneDto.serialNumber && updateDroneDto.serialNumber !== drone.serialNumber) {
            const existingDrone = await this.droneRepository.findBySerialNumber(updateDroneDto.serialNumber);
            if (existingDrone) {
                throw new ConflictException('Drone with this serial number already exists');
            }
        }
        return await super.update(id, updateDroneDto as Partial<Drone>);
    }

    // delete inherited

    async findByStatus(status: DroneStatus): Promise<Drone[]> {
        return await this.droneRepository.findByStatus(status);
    }

    async findActiveDrones(): Promise<Drone[]> {
        return await this.droneRepository.findActiveDrones();
    }

    async findAvailableDrones(): Promise<Drone[]> {
        return await this.droneRepository.findAvailableDrones();
    }

    async updateStatus(id: number, updateStatusDto: UpdateStatusDto): Promise<void> {
        await this.findById(id);
        await this.droneRepository.updateStatus(id, updateStatusDto.status);

        if (updateStatusDto.battery_health !== undefined) {
            await this.droneRepository.updateBatteryHealth(id, updateStatusDto.battery_health);
        }
    }

    async updateBatteryHealth(id: number, battery_health: number): Promise<void> {
        await this.findById(id);
        await this.droneRepository.updateBatteryHealth(id, battery_health);
    }

    async getStatus(): Promise<string[]> {
        return Object.values(droneEntity.DroneStatus);
    }
}
