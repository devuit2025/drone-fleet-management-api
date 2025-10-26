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
    ) {}

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
                name: 'Drone Alpha',
                model: 'DJI Phantom 4 Pro',
                serialNumber: 'DJI001',
                maxPayload: 500,
                batteryCapacity: 100,
                status: DroneStatus.AVAILABLE,
            },
            {
                name: 'Drone Beta',
                model: 'DJI Mavic 3 Pro',
                serialNumber: 'DJI002',
                maxPayload: 300,
                batteryCapacity: 95,
                status: DroneStatus.AVAILABLE,
            },
            {
                name: 'Drone Gamma',
                model: 'DJI Air 3',
                serialNumber: 'DJI003',
                maxPayload: 200,
                batteryCapacity: 85,
                status: DroneStatus.MAINTENANCE,
            },
        ];

        drones.push(...predefinedDrones);

        // Generate additional random drones
        for (let i = 4; i <= 15; i++) {
            const model = faker.helpers.arrayElement(droneModels);
            const status = faker.helpers.arrayElement(Object.values(DroneStatus));

            drones.push({
                name: `Drone ${faker.person.firstName()}`,
                model,
                serialNumber: `DRN${String(i).padStart(3, '0')}`,
                maxPayload: faker.number.int({ min: 100, max: 1000 }),
                batteryCapacity: faker.number.int({ min: 50, max: 100 }),
                status,
                lastMaintenance: faker.helpers.maybe(() => faker.date.past({ years: 1 }), {
                    probability: 0.7,
                }),
            });
        }

        await this.droneRepository.save(drones);
        console.log(`✅ Created ${drones.length} drones`);
    }
}
