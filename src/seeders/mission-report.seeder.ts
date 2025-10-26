import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { MissionReport } from '../entities/mission-report.entity';
import { Mission, MissionStatus } from '../entities/mission.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class MissionReportSeeder {
    constructor(
        @InjectRepository(MissionReport)
        private readonly missionReportRepository: Repository<MissionReport>,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding Mission Reports...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if mission reports already exist
        const existingReports = await this.missionReportRepository.count();
        if (existingReports > 0) {
            console.log('Mission reports already exist, skipping...');
            return;
        }

        // Get completed missions and admin/operator users
        const missions = await this.missionRepository.find({
            where: { status: MissionStatus.COMPLETED },
        });

        const users = await this.userRepository.find({
            where: [{ role: UserRole.ADMIN }, { role: UserRole.OPERATOR }],
        });

        if (missions.length === 0 || users.length === 0) {
            console.log('No completed missions or users found, skipping mission report seeding...');
            return;
        }

        const missionReports: Partial<MissionReport>[] = [];

        // Generate reports for completed missions
        for (const mission of missions) {
            const reportCount = faker.number.int({ min: 1, max: 3 });

            for (let i = 0; i < reportCount; i++) {
                missionReports.push({
                    missionId: mission.id,
                    flightTimeSec: faker.number.int({ min: 300, max: 7200 }), // 5 minutes to 2 hours
                    distanceM: faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }),
                    avgSpeedMps: faker.number.float({ min: 5, max: 25, fractionDigits: 1 }),
                    batteryConsumedPct: faker.number.float({
                        min: 10,
                        max: 80,
                        fractionDigits: 1,
                    }),
                    incidentCount: faker.number.int({ min: 0, max: 5 }),
                });
            }
        }

        await this.missionReportRepository.save(missionReports);
        console.log(`✅ Created ${missionReports.length} mission reports`);
    }
}
