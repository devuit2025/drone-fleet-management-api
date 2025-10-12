import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Telemetry } from '../entities/telemetry.entity';
import { Drone } from '../entities/drone.entity';
import { Mission, MissionStatus } from '../entities/mission.entity';

@Injectable()
export class TelemetrySeeder {
    constructor(
        @InjectRepository(Telemetry)
        private readonly telemetryRepository: Repository<Telemetry>,
        @InjectRepository(Drone)
        private readonly droneRepository: Repository<Drone>,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
    ) {}

    async seed(): Promise<void> {
        console.log('🌱 Seeding Telemetry...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if telemetry already exists
        const existingTelemetry = await this.telemetryRepository.count();
        if (existingTelemetry > 0) {
            console.log('Telemetry already exists, skipping...');
            return;
        }

        // Get drones and missions
        const drones = await this.droneRepository.find();
        const missions = await this.missionRepository.find({
            where: [{ status: MissionStatus.IN_PROGRESS }, { status: MissionStatus.COMPLETED }],
        });

        if (drones.length === 0) {
            console.log('No drones found, skipping telemetry seeding...');
            return;
        }

        const telemetryData: Partial<Telemetry>[] = [];

        // Generate telemetry for each drone
        for (const drone of drones) {
            // Generate telemetry for the last 7 days
            const daysBack = faker.number.int({ min: 1, max: 7 });
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);

            // Generate multiple telemetry entries per day
            const entriesPerDay = faker.number.int({ min: 5, max: 20 });

            for (let day = 0; day < daysBack; day++) {
                for (let entry = 0; entry < entriesPerDay; entry++) {
                    const timestamp = new Date(startDate);
                    timestamp.setDate(timestamp.getDate() + day);
                    timestamp.setHours(faker.number.int({ min: 0, max: 23 }));
                    timestamp.setMinutes(faker.number.int({ min: 0, max: 59 }));
                    timestamp.setSeconds(faker.number.int({ min: 0, max: 59 }));

                    // Generate coordinates around a base location
                    const baseLat = faker.location.latitude();
                    const baseLng = faker.location.longitude();

                    const lat = baseLat + faker.number.float({ min: -0.001, max: 0.001 });
                    const lng = baseLng + faker.number.float({ min: -0.001, max: 0.001 });

                    // Assign mission if available and timestamp is within mission time
                    let missionId: number | null = null;
                    if (missions.length > 0) {
                        const mission = faker.helpers.arrayElement(missions);
                        if (mission.start_time && mission.end_time) {
                            if (timestamp >= mission.start_time && timestamp <= mission.end_time) {
                                missionId = mission.id;
                            }
                        }
                    }

                    telemetryData.push({
                        drone_id: drone.id,
                        mission_id: missionId,
                        timestamp,
                        location: `POINT(${lng} ${lat})`,
                        altitude_m: faker.number.int({ min: 10, max: 500 }),
                        speed_mps: faker.number.float({ min: 0, max: 30, fractionDigits: 1 }),
                        battery_pct: faker.number.int({ min: 10, max: 100 }),
                        status: faker.helpers.arrayElement([
                            'flying',
                            'hovering',
                            'landing',
                            'taking_off',
                        ]),
                        payload_weight: faker.number.float({ min: 0, max: 500, fractionDigits: 1 }),
                    });
                }
            }
        }

        // Limit total telemetry entries to avoid too much data
        const limitedTelemetry = telemetryData.slice(0, 1000);

        await this.telemetryRepository.save(limitedTelemetry);
        console.log(`✅ Created ${limitedTelemetry.length} telemetry entries`);
    }
}
