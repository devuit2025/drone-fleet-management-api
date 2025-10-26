import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Drone, DroneStatus } from '../entities/drone.entity';

@Injectable()
export class DroneSeeder {
    constructor(
        @InjectRepository(Drone)
        private readonly droneRepository: Repository<Drone>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding Drones...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if drones already exist
        const existingDrones = await this.droneRepository.count();
        if (existingDrones > 0) {
            console.log('Drones already exist, skipping...');
            return;
        }

        const droneModels = [
            'DJI Phantom 4 Pro',
            'DJI Mavic 3 Pro',
            'DJI Air 3',
            'DJI Mini 4 Pro',
            'Autel EVO II Pro',
            'Parrot Anafi',
            'Skydio 2',
            'Yuneec Typhoon H',
            'Walkera Vitus Starlight',
            'PowerVision PowerEgg X',
        ];

        const drones: Partial<Drone>[] = [];

        // Create predefined drones
        const predefinedDrones = [
            {
                modelId: 1,
                name: 'Drone Alpha',
                serialNumber: 'DJI001',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 100,
                totalFlightHours: 0,
            },
            {
                modelId: 1,
                name: 'Drone Beta',
                serialNumber: 'DJI002',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 95,
                totalFlightHours: 10,
            },
            {
                modelId: 1,
                name: 'Drone Gamma',
                serialNumber: 'DJI003',
                status: DroneStatus.MAINTENANCE,
                firmwareVersion: '1.0.0',
                batteryHealth: 85,
                totalFlightHours: 50,
            },
        ];

        drones.push(...predefinedDrones);

        // Generate additional random drones
        for (let i = 4; i <= 15; i++) {
            const status = faker.helpers.arrayElement(Object.values(DroneStatus));

            drones.push({
                modelId: 1,
                name: `Drone ${faker.person.firstName()}`,
                serialNumber: `DRN${String(i).padStart(3, '0')}`,
                status,
                firmwareVersion: faker.helpers.maybe(() => faker.system.semver(), {
                    probability: 0.8,
                }),
                batteryHealth: faker.number.int({ min: 50, max: 100 }),
                totalFlightHours: faker.number.int({ min: 0, max: 1000 }),
                lastMaintenance: faker.helpers.maybe(() => faker.date.past({ years: 1 }), {
                    probability: 0.7,
                }),
            });
        }

        await this.droneRepository.save(drones);
        console.log(`✅ Created ${drones.length} drones`);
    }
}
