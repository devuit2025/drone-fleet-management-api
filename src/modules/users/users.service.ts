import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        console.log('Original password:', createUserDto.password);
        console.log('Hashed password:', hashedPassword);
        return await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }
        }

        return await this.userRepository.update(id, updateUserDto);
    }

    async delete(id: number): Promise<void> {
        const user = await this.findById(id);
        await this.userRepository.delete(id);
    }

    async findByRole(role: UserRole): Promise<User[]> {
        return await this.userRepository.findByRole(role);
    }
}
