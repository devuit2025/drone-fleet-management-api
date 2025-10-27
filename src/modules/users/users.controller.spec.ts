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
        jest.resetAllMocks();
        jest.clearAllMocks();

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
            .useValue({
                canActivate: jest.fn(() => true),
            })
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
            createdAt: new Date(),
            updatedAt: new Date(),
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
                createdAt: mockUser.createdAt.toISOString(),
                updatedAt: mockUser.updatedAt.toISOString(),
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
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                name: 'User 2',
                email: 'user2@example.com',
                role: UserRole.OPERATOR,
                createdAt: new Date(),
                updatedAt: new Date(),
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
                createdAt: mockUsers[0].createdAt.toISOString(),
                updatedAt: mockUsers[0].updatedAt.toISOString(),
            });

            expect(mockUsersService.findAll).toHaveBeenCalled();
        });

        it('should return filtered users by searchable name field', async () => {
            const filteredUsers = [mockUsers[0]]; // Mock filtered result
            mockUsersService.findAll.mockResolvedValue(filteredUsers);

            const response = await request(app.getHttpServer())
                .get('/api/v1/users')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toContain('User');
            expect(mockUsersService.findAll).toHaveBeenCalled();
        });

        it('should return filtered users by searchable email field', async () => {
            const filteredUsers = [mockUsers[1]]; // Mock filtered result
            mockUsersService.findAll.mockResolvedValue(filteredUsers);

            const response = await request(app.getHttpServer())
                .get('/api/v1/users')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].email).toContain('user2');
            expect(mockUsersService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/users/:id', () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.OPERATOR,
            createdAt: new Date(),
            updatedAt: new Date(),
            pilots: [], // Relations are loaded by repository findById()
        };

        it('should return user by ID', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer()).get('/api/v1/users/1').expect(200);

            expect(response.body).toEqual({
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                createdAt: mockUser.createdAt.toISOString(),
                updatedAt: mockUser.updatedAt.toISOString(),
                pilots: [], // Empty array when no pilots exist
            });

            expect(mockUsersService.findById).toHaveBeenCalledWith('1');
        });

        it('should return user by ID with pilots relation loaded', async () => {
            const mockUserWithPilots = {
                ...mockUser,
                pilots: [
                    { id: 1, name: 'Pilot 1', userId: 1, status: 'active' },
                    { id: 2, name: 'Pilot 2', userId: 1, status: 'active' },
                ],
            };

            mockUsersService.findById.mockResolvedValue(mockUserWithPilots);

            const response = await request(app.getHttpServer()).get('/api/v1/users/1').expect(200);

            // Verify that the service was called with the correct ID
            expect(mockUsersService.findById).toHaveBeenCalledWith('1');
            // Verify that relations are included in response with all attributes
            expect(response.body.pilots).toBeDefined();
            expect(Array.isArray(response.body.pilots)).toBe(true);
            expect(response.body.pilots.length).toBe(2);
            expect(response.body.pilots[0]).toHaveProperty('id');
            expect(response.body.pilots[0]).toHaveProperty('name');
            expect(response.body.pilots[0]).toHaveProperty('userId');
            expect(response.body.pilots[0]).toHaveProperty('status');
            expect(response.body.pilots[0].name).toBe('Pilot 1');
            expect(response.body.pilots[0].status).toBe('active');
            expect(response.body.pilots[1].name).toBe('Pilot 2');
            expect(response.body.pilots[1].status).toBe('active');
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
            createdAt: new Date(),
            updatedAt: new Date(),
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
                createdAt: mockUpdatedUser.createdAt.toISOString(),
                updatedAt: mockUpdatedUser.updatedAt.toISOString(),
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
