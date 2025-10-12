import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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
    @Column()
    name: string;

    @ApiProperty({ description: 'Email address' })
    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @ApiProperty({ description: 'User role', enum: UserRole })
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn()
    created_at: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updated_at: Date;
}
