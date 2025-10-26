import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '../../../entities/user.entity';

export class UserResponseDto {
    @ApiProperty({ description: 'User ID' })
    id: number;

    @ApiProperty({ description: 'User name' })
    name: string;

    @ApiProperty({ description: 'Email address' })
    email: string;

    @ApiProperty({ description: 'User role', enum: UserRole })
    role: UserRole;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.role = user.role;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
