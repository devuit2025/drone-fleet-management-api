import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DroneRepository } from '../../repositories/drone.repository';
import { Drone, DroneStatus } from '../../entities/drone.entity';
import { CreateDroneDto, UpdateDroneDto, UpdateLocationDto, UpdateStatusDto } from './dto';

@Injectable()
export class DronesService {
    constructor(private readonly droneRepository: DroneRepository) { }

    async create(createDroneDto: CreateDroneDto): Promise<Drone> {
        const existingDrone = await this.droneRepository.findBySerialNumber(
            createDroneDto.serialNumber,
        );
        if (existingDrone) {
            throw new ConflictException('Drone with this serial number already exists');
        }

        const droneData = {
            name: createDroneDto.name,
            model: createDroneDto.model,
            serial_number: createDroneDto.serialNumber,
            status: createDroneDto.status || DroneStatus.AVAILABLE,
            max_payload: createDroneDto.maxPayload,
            battery_capacity: createDroneDto.batteryCapacity,
            last_maintenance: createDroneDto.lastMaintenance,
        };

        return await this.droneRepository.create(droneData);
    }

    async findAll(): Promise<Drone[]> {
        return await this.droneRepository.findAll();
    }

    async findById(id: number): Promise<Drone> {
        const drone = await this.droneRepository.findById(id);
        if (!drone) {
            throw new NotFoundException('Drone not found');
        }
        return drone;
    }

    async findBySerialNumber(serialNumber: string): Promise<Drone> {
        const drone = await this.droneRepository.findBySerialNumber(serialNumber);
        if (!drone) {
            throw new NotFoundException('Drone not found');
        }
        return drone;
    }

    async update(id: number, updateDroneDto: UpdateDroneDto): Promise<Drone> {
        const drone = await this.findById(id);

        if (updateDroneDto.serialNumber && updateDroneDto.serialNumber !== drone.serial_number) {
            const existingDrone = await this.droneRepository.findBySerialNumber(
                updateDroneDto.serialNumber,
            );
            if (existingDrone) {
                throw new ConflictException('Drone with this serial number already exists');
            }
        }

        const updateData = {
            ...updateDroneDto,
            serial_number: updateDroneDto.serialNumber,
            max_payload: updateDroneDto.maxPayload,
            battery_capacity: updateDroneDto.batteryCapacity,
            last_maintenance: updateDroneDto.lastMaintenance,
        };

        return await this.droneRepository.update(id, updateData);
    }

    async delete(id: number): Promise<void> {
        const drone = await this.findById(id);
        await this.droneRepository.delete(id);
    }

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

        if (updateStatusDto.battery_capacity !== undefined) {
            await this.droneRepository.updateBatteryCapacity(id, updateStatusDto.battery_capacity);
        }
    }

    async updateBatteryCapacity(id: number, battery_capacity: number): Promise<void> {
        await this.findById(id);
        await this.droneRepository.updateBatteryCapacity(id, battery_capacity);
    }
}
