import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SimpleSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async seed(): Promise<void> {
    console.log('🌱 Seeding Simple Data...');

    // Check if users already exist
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping...');
      return;
    }

    const users: Partial<User>[] = [
      {
        name: 'Admin User',
        email: 'admin@dronefleet.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
      },
      {
        name: 'John Smith',
        email: 'john.smith@dronefleet.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.OPERATOR,
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@dronefleet.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.VIEWER,
      },
    ];

    await this.userRepository.save(users);
    console.log(`✅ Created ${users.length} users`);
  }
}
