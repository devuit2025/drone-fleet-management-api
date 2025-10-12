import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
    @Column()
    user_id: number;

    @ApiProperty({ description: 'Pilot name' })
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
    @CreateDateColumn()
    created_at: Date;

    @ApiProperty({ description: 'Last update date' })
    @UpdateDateColumn()
    updated_at: Date;
}
