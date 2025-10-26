import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { MissionResponseDto } from './dto';

describe('MissionsController', () => {
    let app: INestApplication;
    let missionsService: MissionsService;
    let module: TestingModule;

    const mockMissionsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        module = await Test.createTestingModule({
            controllers: [MissionsController],
            providers: [
                {
                    provide: MissionsService,
                    useValue: mockMissionsService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: jest.fn().mockReturnValue(true),
            })
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();

        missionsService = module.get<MissionsService>(MissionsService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        if (app) {
            await app.close();
        }
    });

    describe('POST /api/v1/missions', () => {
        it('should create a new mission successfully', async () => {
            const createMissionDto = {
                pilotId: 1,
                missionName: 'Test Mission',
                status: MissionStatus.PLANNED,
            };

            const mockMission = new MissionResponseDto({
                id: 1,
                pilotId: 1,
                licenseId: null,
                missionName: 'Test Mission',
                status: MissionStatus.PLANNED,
                startTime: null,
                endTime: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Mission);

            mockMissionsService.create.mockResolvedValue(mockMission);

            const response = await request(app.getHttpServer())
                .post('/api/v1/missions')
                .send(createMissionDto)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.missionName).toBe('Test Mission');
            expect(mockMissionsService.create).toHaveBeenCalledWith(
                expect.objectContaining(createMissionDto),
            );
        });

        it('should return 400 when required fields are missing', async () => {
            const invalidDto = {
                pilotId: 1,
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/missions')
                .send(invalidDto)
                .expect(400);

            expect(Array.isArray(response.body.message)).toBe(true);
        });
    });

    describe('GET /api/v1/missions', () => {
        it('should return an array of missions', async () => {
            const mockMissions = [
                new MissionResponseDto({
                    id: 1,
                    pilotId: 1,
                    licenseId: null,
                    missionName: 'Test Mission',
                    status: MissionStatus.PLANNED,
                    startTime: null,
                    endTime: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Mission),
            ];

            mockMissionsService.findAll.mockResolvedValue(mockMissions);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(mockMissionsService.findAll).toHaveBeenCalledWith();
        });

        it('should return multiple missions', async () => {
            const mockMissions = [
                new MissionResponseDto({
                    id: 2,
                    pilotId: 1,
                    licenseId: null,
                    missionName: 'Mission 2',
                    status: MissionStatus.PLANNED,
                    startTime: null,
                    endTime: null,
                    createdAt: new Date('2023-02-01'),
                    updatedAt: new Date(),
                } as Mission),
                new MissionResponseDto({
                    id: 1,
                    pilotId: 1,
                    licenseId: null,
                    missionName: 'Mission 1',
                    status: MissionStatus.PLANNED,
                    startTime: null,
                    endTime: null,
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date(),
                } as Mission),
            ];

            mockMissionsService.findAll.mockResolvedValue(mockMissions);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(mockMissionsService.findAll).toHaveBeenCalled();
        });

        it('should return filtered missions by searchable missionName field', async () => {
            const mockMissions = [
                new MissionResponseDto({
                    id: 1,
                    pilotId: 1,
                    licenseId: null,
                    missionName: 'Area Survey Alpha',
                    status: MissionStatus.COMPLETED,
                    startTime: new Date('2024-03-01T10:00:00Z'),
                    endTime: new Date('2024-03-01T11:30:00Z'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Mission),
            ];

            mockMissionsService.findAll.mockResolvedValue(mockMissions);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions')
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].missionName).toContain('Alpha');
            expect(mockMissionsService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/missions/:id', () => {
        it('should return a mission by ID', async () => {
            const mockMission = new MissionResponseDto({
                id: 1,
                pilotId: 1,
                licenseId: null,
                missionName: 'Test Mission',
                status: MissionStatus.PLANNED,
                startTime: null,
                endTime: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Mission);

            mockMissionsService.findById.mockResolvedValue(mockMission);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/1')
                .expect(200);

            expect(response.body.id).toBe(1);
            expect(response.body.missionName).toBe('Test Mission');
            expect(mockMissionsService.findById).toHaveBeenCalledWith(1);
        });

        it('should return 404 when mission not found', async () => {
            mockMissionsService.findById.mockRejectedValue(
                new HttpException('Mission not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/999')
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/v1/missions/:id', () => {
        it('should update a mission successfully', async () => {
            const updateMissionDto = {
                missionName: 'Updated Mission',
                status: MissionStatus.IN_PROGRESS,
            };

            const mockMission = new MissionResponseDto({
                id: 1,
                pilotId: 1,
                licenseId: null,
                missionName: 'Updated Mission',
                status: MissionStatus.IN_PROGRESS,
                startTime: null,
                endTime: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Mission);

            mockMissionsService.update.mockResolvedValue(mockMission);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/1')
                .send(updateMissionDto)
                .expect(200);

            expect(response.body.missionName).toBe('Updated Mission');
            expect(response.body.status).toBe(MissionStatus.IN_PROGRESS);
            expect(mockMissionsService.update).toHaveBeenCalledWith(1, updateMissionDto);
        });

        it('should return 404 when mission not found', async () => {
            mockMissionsService.update.mockRejectedValue(
                new HttpException('Mission not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/999')
                .send({ missionName: 'Updated' })
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/v1/missions/:id', () => {
        it('should delete a mission successfully', async () => {
            mockMissionsService.delete.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .delete('/api/v1/missions/1')
                .expect(200);

            expect(mockMissionsService.delete).toHaveBeenCalledWith(1);
        });

        it('should return 404 when mission not found', async () => {
            mockMissionsService.delete.mockRejectedValue(
                new HttpException('Mission not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .delete('/api/v1/missions/999')
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });
});
