import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../../entities/user.entity';

describe('UsersController', () => {
    let app: INestApplication;
    let usersService: UsersService;
    let module: TestingModule;

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByRole: jest.fn(),
    };

    const mockJwtAuthGuard = {
        canActivate: jest.fn().mockReturnValue(true),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('POST /api/v1/users', () => {
        const createUserDto = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: UserRole.OPERATOR,
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashed-password',
            role: UserRole.OPERATOR,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should create a new user successfully', async () => {
            mockUsersService.create.mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer())
                .post('/api/v1/users')
                .send(createUserDto)
                .expect(201);

            expect(response.body).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                created_at: mockUser.created_at.toISOString(),
                updated_at: mockUser.updated_at.toISOString(),
            });

            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should return 409 when user already exists', async () => {
            mockUsersService.create.mockRejectedValue(
                new HttpException('User with this email already exists', HttpStatus.CONFLICT),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/users')
                .send(createUserDto)
                .expect(409);

            expect(response.body).toEqual({
                message: 'User with this email already exists',
                statusCode: 409,
            });

            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should validate required fields', async () => {
            const invalidDto = {
                name: 'Test',
                email: 'invalid-email',
                password: '123', // too short
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/users')
                .send(invalidDto)
                .expect(400);

            expect(response.body.message).toEqual([
                'email must be an email',
                'password must be longer than or equal to 6 characters',
            ]);
        });
    });

    describe('GET /api/v1/users', () => {
        const mockUsers = [
            {
                id: 1,
                name: 'User 1',
                email: 'user1@example.com',
                role: UserRole.ADMIN,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                name: 'User 2',
                email: 'user2@example.com',
                role: UserRole.OPERATOR,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return all users', async () => {
            mockUsersService.findAll.mockResolvedValue(mockUsers);

            const response = await request(app.getHttpServer()).get('/api/v1/users').expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toEqual({
                id: mockUsers[0].id,
                name: mockUsers[0].name,
                email: mockUsers[0].email,
                role: mockUsers[0].role,
                created_at: mockUsers[0].created_at.toISOString(),
                updated_at: mockUsers[0].updated_at.toISOString(),
            });

            expect(mockUsersService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/users/:id', () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.OPERATOR,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should return user by ID', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer()).get('/api/v1/users/1').expect(200);

            expect(response.body).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                created_at: mockUser.created_at.toISOString(),
                updated_at: mockUser.updated_at.toISOString(),
            });

            expect(mockUsersService.findById).toHaveBeenCalledWith('1');
        });

        it('should return 404 when user not found', async () => {
            mockUsersService.findById.mockRejectedValue(
                new HttpException('User not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .get('/api/v1/users/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'User not found',
                statusCode: 404,
            });

            expect(mockUsersService.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('PATCH /api/v1/users/:id', () => {
        const updateUserDto = {
            name: 'Updated User',
            email: 'updated@example.com',
        };

        const mockUpdatedUser = {
            id: 1,
            name: 'Updated User',
            email: 'updated@example.com',
            role: UserRole.OPERATOR,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should update user successfully', async () => {
            mockUsersService.update.mockResolvedValue(mockUpdatedUser);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/1')
                .send(updateUserDto)
                .expect(200);

            expect(response.body).toEqual({
                id: mockUpdatedUser.id,
                name: mockUpdatedUser.name,
                email: mockUpdatedUser.email,
                role: mockUpdatedUser.role,
                created_at: mockUpdatedUser.created_at.toISOString(),
                updated_at: mockUpdatedUser.updated_at.toISOString(),
            });

            expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
        });

        it('should return 404 when user not found', async () => {
            mockUsersService.update.mockRejectedValue(
                new HttpException('User not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/999')
                .send(updateUserDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'User not found',
                statusCode: 404,
            });

            expect(mockUsersService.update).toHaveBeenCalledWith('999', updateUserDto);
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should delete user successfully', async () => {
            mockUsersService.delete.mockResolvedValue(undefined);

            await request(app.getHttpServer()).delete('/api/v1/users/1').expect(200);

            expect(mockUsersService.delete).toHaveBeenCalledWith('1');
        });

        it('should return 404 when user not found', async () => {
            mockUsersService.delete.mockRejectedValue(
                new HttpException('User not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .delete('/api/v1/users/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'User not found',
                statusCode: 404,
            });

            expect(mockUsersService.delete).toHaveBeenCalledWith('999');
        });
    });
});
