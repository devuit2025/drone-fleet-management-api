import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Searchable } from '../repositories/base.repository';
import { Pilot } from './pilot.entity';

export enum UserRole {
    ADMIN = 'admin',
    OPERATOR = 'operator',
    VIEWER = 'viewer',
}

@Entity('users')
export class User {
    @ApiProperty({ description: 'User ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'User name' })
    @Searchable({ operator: 'like' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Email address' })
    @Searchable({ operator: 'like' })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'User role', enum: UserRole })
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;

    @Exclude()
    @Column()
    password: string;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Pilot, pilot => pilot.user, { createForeignKeyConstraints: false })
    pilots: Pilot[];
}
