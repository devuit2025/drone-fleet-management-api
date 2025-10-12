import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
        });
    }

    async findByRole(role: UserRole): Promise<User[]> {
        return await this.userRepository.find({
            where: { role },
        });
    }
}
