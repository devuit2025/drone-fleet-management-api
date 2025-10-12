import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeeder {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async seed(): Promise<void> {
        console.log('🌱 Seeding Users...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if users already exist
        const existingUsers = await this.userRepository.count();
        if (existingUsers > 0) {
            console.log('Users already exist, skipping...');
            return;
        }

        const users: Partial<User>[] = [
            // Admin user
            {
                name: 'Admin User',
                email: 'admin@dronefleet.com',
                password: await bcrypt.hash('admin123', 10),
                role: UserRole.ADMIN,
            },
            // Operator users
            {
                name: 'John Smith',
                email: 'john.smith@dronefleet.com',
                password: await bcrypt.hash('password123', 10),
                role: UserRole.OPERATOR,
            },
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@dronefleet.com',
                password: await bcrypt.hash('password123', 10),
                role: UserRole.OPERATOR,
            },
            // Viewer users
            {
                name: 'Mike Wilson',
                email: 'mike.wilson@dronefleet.com',
                password: await bcrypt.hash('password123', 10),
                role: UserRole.VIEWER,
            },
            {
                name: 'Emily Davis',
                email: 'emily.davis@dronefleet.com',
                password: await bcrypt.hash('password123', 10),
                role: UserRole.VIEWER,
            },
        ];

        // Generate additional random users
        for (let i = 0; i < 10; i++) {
            const role = faker.helpers.arrayElement(Object.values(UserRole));
            users.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: await bcrypt.hash('password123', 10),
                role,
            });
        }

        await this.userRepository.save(users);
        console.log(`✅ Created ${users.length} users`);
    }
}
