import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../../entities/user.entity';

describe('AuthController', () => {
    let app: INestApplication;
    let authService: AuthService;
    let module: TestingModule;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        validateUser: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        authService = module.get<AuthService>(AuthService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('POST /api/v1/auth/register', () => {
        const registerDto = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: UserRole.OPERATOR,
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.OPERATOR,
        };

        const mockAuthResponse = {
            user: mockUser,
            token: 'mock-jwt-token',
        };

        it('should register a new user successfully', async () => {
            mockAuthService.register.mockResolvedValue(mockAuthResponse);

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(registerDto)
                .expect(201);

            expect(response.body).toEqual(mockAuthResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
        });

        it('should return 409 when user already exists', async () => {
            mockAuthService.register.mockRejectedValue(
                new HttpException('User already exists', HttpStatus.CONFLICT),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(registerDto)
                .expect(409);

            expect(response.body).toEqual({
                message: 'User already exists',
                statusCode: 409,
            });

            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
        });

        it('should validate required fields', async () => {
            const invalidDto = {
                name: 'Test',
                email: 'invalid-email',
                password: '123', // too short
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(invalidDto)
                .expect(400);

            expect(response.body.message).toEqual([
                'email must be an email',
                'password must be longer than or equal to 6 characters',
            ]);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.OPERATOR,
        };

        const mockAuthResponse = {
            user: mockUser,
            token: 'mock-jwt-token',
        };

        it('should login user successfully', async () => {
            mockAuthService.login.mockResolvedValue(mockAuthResponse);

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send(loginDto)
                .expect(201);

            expect(response.body).toEqual(mockAuthResponse);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should return 401 for invalid credentials', async () => {
            mockAuthService.login.mockRejectedValue(
                new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send(loginDto)
                .expect(401);

            expect(response.body).toEqual({
                message: 'Invalid credentials',
                statusCode: 401,
            });

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should validate required fields', async () => {
            const invalidDto = {
                email: 'invalid-email',
                password: '123', // too short
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send(invalidDto)
                .expect(400);

            expect(response.body.message).toEqual([
                'email must be an email',
                'password must be longer than or equal to 6 characters',
            ]);
        });
    });
});
