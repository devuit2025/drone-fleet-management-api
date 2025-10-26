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
}
