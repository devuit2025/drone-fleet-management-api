import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Pilot, PilotStatus } from '../entities/pilot.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class PilotSeeder {
    constructor(
        @InjectRepository(Pilot)
        private readonly pilotRepository: Repository<Pilot>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async seed(): Promise<void> {
        console.log('🌱 Seeding Pilots...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if pilots already exist
        const existingPilots = await this.pilotRepository.count();
        if (existingPilots > 0) {
            console.log('Pilots already exist, skipping...');
            return;
        }

        // Get operator users to assign as pilots
        const operatorUsers = await this.userRepository.find({
            where: { role: UserRole.OPERATOR },
        });

        if (operatorUsers.length === 0) {
            console.log('No operator users found, skipping pilot seeding...');
            return;
        }

        const pilots: Partial<Pilot>[] = [];

        // Create pilots for operator users
        for (const user of operatorUsers) {
            pilots.push({
                user_id: user.id,
                name: user.name,
                status: faker.helpers.arrayElement(Object.values(PilotStatus)),
            });
        }

        // Generate additional random pilots
        const additionalPilots = faker.number.int({ min: 3, max: 8 });
        for (let i = 0; i < additionalPilots; i++) {
            pilots.push({
                user_id: faker.helpers.arrayElement(operatorUsers).id,
                name: faker.person.fullName(),
                status: faker.helpers.arrayElement(Object.values(PilotStatus)),
            });
        }

        await this.pilotRepository.save(pilots);
        console.log(`✅ Created ${pilots.length} pilots`);
    }
}
