import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { FlightLog } from '../entities/flight-log.entity';
import { Mission, MissionStatus } from '../entities/mission.entity';

@Injectable()
export class FlightLogSeeder {
    constructor(
        @InjectRepository(FlightLog)
        private readonly flightLogRepository: Repository<FlightLog>,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding Flight Logs...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if flight logs already exist
        const existingLogs = await this.flightLogRepository.count();
        if (existingLogs > 0) {
            console.log('Flight logs already exist, skipping...');
            return;
        }

        // Get missions that are in progress or completed
        const missions = await this.missionRepository.find({
            where: [{ status: MissionStatus.IN_PROGRESS }, { status: MissionStatus.COMPLETED }],
        });

        if (missions.length === 0) {
            console.log('No active missions found, skipping flight log seeding...');
            return;
        }

        const flightLogs: Partial<FlightLog>[] = [];

        const eventTypes = ['info', 'warning', 'error', 'debug'];

        const logMessages = [
            'Mission started successfully',
            'Waypoint reached',
            'Photo captured',
            'Video recording started',
            'Battery level normal',
            'GPS signal strong',
            'Weather conditions good',
            'Mission completed successfully',
            'Returning to base',
            'Landing sequence initiated',
            'Low battery warning',
            'GPS signal weak',
            'High wind detected',
            'Temperature rising',
            'Altitude limit reached',
            'Speed limit exceeded',
            'Obstacle detected',
            'Weather conditions deteriorating',
            'Communication signal weak',
            'Payload weight approaching limit',
            'GPS signal lost',
            'Battery critical',
            'Motor failure detected',
            'Communication lost',
            'Navigation system error',
            'Camera malfunction',
            'Sensor error',
            'Autopilot disengaged',
            'Emergency landing required',
            'Mission aborted',
        ];

        // Generate flight logs for each mission
        for (const mission of missions) {
            const logCount = faker.number.int({ min: 5, max: 20 });

            for (let i = 0; i < logCount; i++) {
                const eventType = faker.helpers.arrayElement(eventTypes);

                // Generate timestamp within mission duration
                let timestamp: Date;
                if (mission.startTime && mission.endTime) {
                    timestamp = faker.date.between({
                        from: mission.startTime,
                        to: mission.endTime,
                    });
                } else if (mission.startTime) {
                    timestamp = faker.date.recent({ days: 30 });
                } else {
                    timestamp = faker.date.recent({ days: 30 });
                }

                flightLogs.push({
                    missionId: mission.id,
                    timestamp,
                    eventType: eventType,
                    description: faker.helpers.arrayElement(logMessages),
                });
            }
        }

        await this.flightLogRepository.save(flightLogs);
        console.log(`✅ Created ${flightLogs.length} flight logs`);
    }
}
