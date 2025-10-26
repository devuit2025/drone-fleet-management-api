import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';
import { User } from './user.entity';
import { License } from './license.entity';
import { Simulation } from './simulation.entity';

export enum PilotStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity('pilots')
export class Pilot {
    @ApiProperty({ description: 'Pilot ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'User ID' })
    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty({ description: 'Pilot name' })
    @Searchable({ operator: 'like' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Pilot status', enum: PilotStatus })
    @Column({
        type: 'enum',
        enum: PilotStatus,
        default: PilotStatus.ACTIVE,
    })
    status: PilotStatus;

    @ApiProperty({ description: 'Creation date' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => License, license => license.pilot, { createForeignKeyConstraints: false })
    licenses: License[];

    @OneToMany(() => Simulation, simulation => simulation.pilot, { createForeignKeyConstraints: false })
    simulations: Simulation[];
}
