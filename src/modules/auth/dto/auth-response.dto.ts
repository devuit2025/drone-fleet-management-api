import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };

  @ApiProperty({ description: 'JWT token' })
  token: string;
}
