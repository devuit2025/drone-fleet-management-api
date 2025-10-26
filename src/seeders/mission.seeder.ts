import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Mission, MissionStatus } from '../entities/mission.entity';
import { Pilot } from '../entities/pilot.entity';
import { License } from '../entities/license.entity';

@Injectable()
export class MissionSeeder {
    constructor(
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        @InjectRepository(Pilot)
        private readonly pilotRepository: Repository<Pilot>,
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding Missions...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if missions already exist
        const existingMissions = await this.missionRepository.count();
        if (existingMissions > 0) {
            console.log('Missions already exist, skipping...');
            return;
        }

        // Get pilots and licenses
        const pilots = await this.pilotRepository.find();
        const licenses = await this.licenseRepository.find();

        if (pilots.length === 0 || licenses.length === 0) {
            console.log('No pilots or licenses found, skipping mission seeding...');
            return;
        }

        const missions: Partial<Mission>[] = [];

        const missionTypes = [
            'Surveillance',
            'Search and Rescue',
            'Aerial Photography',
            'Mapping',
            'Inspection',
            'Delivery',
            'Environmental Monitoring',
            'Security Patrol',
        ];

        // Create missions
        for (let i = 0; i < 20; i++) {
            const pilot = faker.helpers.arrayElement(pilots);
            const license = faker.helpers.arrayElement(licenses);
            const status = faker.helpers.arrayElement(Object.values(MissionStatus));

            let startTime: Date | null = null;
            let endTime: Date | null = null;

            if (status === MissionStatus.IN_PROGRESS || status === MissionStatus.COMPLETED) {
                startTime = faker.date.recent({ days: 30 });
                if (status === MissionStatus.COMPLETED) {
                    endTime = faker.date.between({ from: startTime, to: new Date() });
                }
            } else if (status === MissionStatus.PLANNED) {
                startTime = faker.date.soon({ days: 30 });
            }

            missions.push({
                pilotId: pilot.id,
                licenseId: license.id,
                missionName: `${faker.helpers.arrayElement(missionTypes)} Mission ${i + 1}`,
                status,
                startTime,
                endTime,
            });
        }

        await this.missionRepository.save(missions);
        console.log(`✅ Created ${missions.length} missions`);
    }
}
