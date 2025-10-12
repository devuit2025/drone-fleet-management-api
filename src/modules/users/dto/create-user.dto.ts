import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({ description: 'User name' })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Password' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'User role', enum: UserRole, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
