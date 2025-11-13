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
            expect(mockMissionsService.findAll).toHaveBeenCalledWith({
                page: 1,
                per: 30,
            });
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

        it('should return mission by ID with pilot and drone relations loaded', async () => {
            const assignedAt = new Date();
            const mockMissionWithRelations = new MissionResponseDto({
                id: 1,
                pilotId: 1,
                licenseId: null,
                missionName: 'Test Mission',
                status: MissionStatus.PLANNED,
                startTime: null,
                endTime: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                pilot: {
                    id: 1,
                    name: 'Test Pilot',
                    userId: 1,
                    status: 'active',
                },
                missionDrones: [
                    {
                        id: 10,
                        missionId: 1,
                        droneId: 1,
                        assignedAt,
                        drone: { id: 1, name: 'Test Drone 1', serialNumber: 'DRONE-001', status: 'available' } as any,
                        waypoints: [
                            {
                                id: 1,
                                missionDroneId: 10,
                                seqNumber: 1,
                                geoPoint: { type: 'Point', coordinates: [106.6, 10.7] },
                                altitudeM: 50,
                                speedMps: 10,
                                action: 'fly_to',
                                createdAt: new Date(),
                            },
                            {
                                id: 2,
                                missionDroneId: 10,
                                seqNumber: 2,
                                geoPoint: { type: 'Point', coordinates: [106.61, 10.71] },
                                altitudeM: 100,
                                speedMps: 15,
                                action: 'hover',
                                createdAt: new Date(),
                            },
                        ],
                    } as any,
                    {
                        id: 11,
                        missionId: 1,
                        droneId: 2,
                        assignedAt,
                        drone: { id: 2, name: 'Test Drone 2', serialNumber: 'DRONE-002', status: 'available' } as any,
                        waypoints: [
                            {
                                id: 3,
                                missionDroneId: 11,
                                seqNumber: 1,
                                geoPoint: { type: 'Point', coordinates: [106.7, 10.72] },
                                altitudeM: 60,
                                speedMps: 12,
                                action: 'fly_to',
                                createdAt: new Date(),
                            },
                        ],
                    } as any,
                ],
                telemetry: [
                    { id: 1, droneId: 1, missionId: 1, timestamp: new Date(), altitudeM: 100, speedMps: 10, batteryPct: 80, status: 'flying' },
                    { id: 2, droneId: 1, missionId: 1, timestamp: new Date(), altitudeM: 150, speedMps: 15, batteryPct: 75, status: 'flying' },
                ],
                flightLogs: [
                    { id: 1, missionId: 1, eventType: 'info', description: 'Mission started', timestamp: new Date() },
                    { id: 2, missionId: 1, eventType: 'info', description: 'Waypoint reached', timestamp: new Date() },
                ],
                reports: [
                    { id: 1, missionId: 1, flightTimeSec: 3600, distanceM: 10000, avgSpeedMps: 15.5, batteryConsumedPct: 45.2, incidentCount: 0, createdAt: new Date(), updatedAt: new Date() },
                    { id: 2, missionId: 1, flightTimeSec: 7200, distanceM: 20000, avgSpeedMps: 18.2, batteryConsumedPct: 60.5, incidentCount: 1, createdAt: new Date(), updatedAt: new Date() },
                ],
                simulations: [
                    { id: 1, pilotId: 1, missionId: 1, simStartTime: new Date(), simEndTime: new Date(), parameters: { type: 'weather' } },
                    { id: 2, pilotId: 1, missionId: 1, simStartTime: new Date(), simEndTime: new Date(), parameters: { type: 'route' } },
                ],
            } as any);

            mockMissionsService.findById.mockResolvedValue(mockMissionWithRelations);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/1')
                .expect(200);

            expect(response.body.id).toBe(1);
            // Verify that relations are included in response
            expect(response.body.pilot).toBeDefined();
            expect(response.body.pilot.name).toBe('Test Pilot');
            // Verify missionDrones nesting
            expect(response.body.missionDrones).toBeDefined();
            expect(Array.isArray(response.body.missionDrones)).toBe(true);
            expect(response.body.missionDrones.length).toBe(2);

            const firstMissionDrone = response.body.missionDrones[0];
            expect(firstMissionDrone.droneId).toBe(1);
            expect(firstMissionDrone.drone).toBeDefined();
            expect(firstMissionDrone.drone.name).toBe('Test Drone 1');
            expect(firstMissionDrone.assignedAt).toBeDefined();
            expect(Array.isArray(firstMissionDrone.waypoints)).toBe(true);
            expect(firstMissionDrone.waypoints.length).toBe(2);
            expect(firstMissionDrone.waypoints[0].geoPoint).toBe('POINT(106.6 10.7)');

            const secondMissionDrone = response.body.missionDrones[1];
            expect(secondMissionDrone.droneId).toBe(2);
            expect(secondMissionDrone.drone.name).toBe('Test Drone 2');
            expect(secondMissionDrone.waypoints.length).toBe(1);
            expect(secondMissionDrone.waypoints[0].geoPoint).toBe('POINT(106.7 10.72)');

            expect(response.body.telemetry).toBeDefined();
            expect(Array.isArray(response.body.telemetry)).toBe(true);
            expect(response.body.telemetry.length).toBe(2);
            expect(response.body.telemetry[0].id).toBe(1);
            expect(response.body.telemetry[0].droneId).toBe(1);
            expect(response.body.telemetry[0].missionId).toBe(1);
            expect(response.body.telemetry[0].altitudeM).toBe(100);
            expect(response.body.telemetry[0].speedMps).toBe(10);
            expect(response.body.telemetry[0].batteryPct).toBe(80);
            expect(response.body.telemetry[0].status).toBe('flying');
            expect(response.body.telemetry[1].id).toBe(2);
            expect(response.body.telemetry[1].droneId).toBe(1);
            expect(response.body.telemetry[1].missionId).toBe(1);
            expect(response.body.telemetry[1].altitudeM).toBe(150);
            expect(response.body.telemetry[1].speedMps).toBe(15);
            expect(response.body.telemetry[1].batteryPct).toBe(75);
            expect(response.body.telemetry[1].status).toBe('flying');

            expect(response.body.flightLogs).toBeDefined();
            expect(Array.isArray(response.body.flightLogs)).toBe(true);
            expect(response.body.flightLogs.length).toBe(2);
            expect(response.body.flightLogs[0].id).toBe(1);
            expect(response.body.flightLogs[0].missionId).toBe(1);
            expect(response.body.flightLogs[0].eventType).toBe('info');
            expect(response.body.flightLogs[0].description).toBe('Mission started');
            expect(response.body.flightLogs[1].id).toBe(2);
            expect(response.body.flightLogs[1].missionId).toBe(1);
            expect(response.body.flightLogs[1].eventType).toBe('info');
            expect(response.body.flightLogs[1].description).toBe('Waypoint reached');

            expect(response.body.reports).toBeDefined();
            expect(Array.isArray(response.body.reports)).toBe(true);
            expect(response.body.reports.length).toBe(2);
            expect(response.body.reports[0].id).toBe(1);
            expect(response.body.reports[0].missionId).toBe(1);
            expect(response.body.reports[0].flightTimeSec).toBe(3600);
            expect(response.body.reports[0].distanceM).toBe(10000);
            expect(response.body.reports[0].avgSpeedMps).toBe(15.5);
            expect(response.body.reports[0].batteryConsumedPct).toBe(45.2);
            expect(response.body.reports[0].incidentCount).toBe(0);
            expect(response.body.reports[1].id).toBe(2);
            expect(response.body.reports[1].missionId).toBe(1);
            expect(response.body.reports[1].flightTimeSec).toBe(7200);
            expect(response.body.reports[1].distanceM).toBe(20000);
            expect(response.body.reports[1].avgSpeedMps).toBe(18.2);
            expect(response.body.reports[1].batteryConsumedPct).toBe(60.5);
            expect(response.body.reports[1].incidentCount).toBe(1);

            expect(response.body.simulations).toBeDefined();
            expect(Array.isArray(response.body.simulations)).toBe(true);
            expect(response.body.simulations.length).toBe(2);
            expect(response.body.simulations[0].id).toBe(1);
            expect(response.body.simulations[0].pilotId).toBe(1);
            expect(response.body.simulations[0].missionId).toBe(1);
            expect(response.body.simulations[0].parameters.type).toBe('weather');
            expect(response.body.simulations[1].id).toBe(2);
            expect(response.body.simulations[1].pilotId).toBe(1);
            expect(response.body.simulations[1].missionId).toBe(1);
            expect(response.body.simulations[1].parameters.type).toBe('route');

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
