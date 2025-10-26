import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MissionStatus } from '../../entities/mission.entity';

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
        findByStatus: jest.fn(),
        findByPilot: jest.fn(),
        findByDrone: jest.fn(),
        findActiveFlights: jest.fn(),
        findFlightsByDateRange: jest.fn(),
        startFlight: jest.fn(),
        endFlight: jest.fn(),
        addPathPoint: jest.fn(),
        getFlightPath: jest.fn(),
    };

    const mockJwtAuthGuard = {
        canActivate: jest.fn().mockReturnValue(true),
    };

    const mockJwtStrategy = {
        validate: jest.fn().mockReturnValue({
            id: 1,
            email: 'test@example.com',
            role: 'admin',
            name: 'Test User',
        }),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                PassportModule,
                JwtModule.register({
                    secret: 'test-secret',
                    signOptions: { expiresIn: '24h' },
                }),
            ],
            controllers: [MissionsController],
            providers: [
                {
                    provide: MissionsService,
                    useValue: mockMissionsService,
                },
                {
                    provide: JwtStrategy,
                    useValue: mockJwtStrategy,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        missionsService = module.get<MissionsService>(MissionsService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('POST /api/v1/missions', () => {
        const createFlightDto = {
            name: 'Test Flight',
            description: 'Test flight description',
            plannedStartTime: '2024-01-01T08:00:00Z',
            plannedDuration: 60,
            startLatitude: 10.7,
            startLongitude: 106.6,
            startAltitude: 100,
            pilotId: '550e8400-e29b-41d4-a716-446655440000',
            droneId: '550e8400-e29b-41d4-a716-446655440001',
            weatherConditions: 'Clear',
            notes: 'Test notes',
        };

        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should create a new flight successfully', async () => {
            mockMissionsService.create.mockResolvedValue(mockFlight);

            const response = await request(app.getHttpServer())
                .post('/api/v1/missions')
                .send(createFlightDto)
                .expect(201);

            expect(response.body).toEqual({
                id: mockFlight.id,
                pilot_id: mockFlight.pilot_id,
                license_id: mockFlight.license_id,
                mission_name: mockFlight.mission_name,
                status: mockFlight.status,
                start_time: mockFlight.start_time.toISOString(),
                end_time: mockFlight.end_time,
                createdAt: mockFlight.createdAt.toISOString(),
                updatedAt: mockFlight.updatedAt.toISOString(),
            });

            expect(mockMissionsService.create).toHaveBeenCalledWith(createFlightDto);
        });

        it('should validate required fields', async () => {
            const invalidDto = {
                name: 'Test',
                plannedStartTime: 'invalid-date',
                plannedDuration: -1, // negative duration
                startLatitude: 'invalid-lat',
                startLongitude: 'invalid-lng',
                startAltitude: 'invalid-alt',
            };

            await request(app.getHttpServer()).post('/api/v1/missions').send(invalidDto).expect(400);
        });
    });

    describe('GET /api/v1/missions', () => {
        const mockFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Flight 1',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                pilot_id: 2,
                license_id: 2,
                mission_name: 'Flight 2',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-02T09:00:00Z'),
                end_time: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return all flights', async () => {
            mockMissionsService.findAll.mockResolvedValue(mockFlights);

            const response = await request(app.getHttpServer()).get('/api/v1/missions').expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toEqual({
                id: mockFlights[0].id,
                pilot_id: mockFlights[0].pilot_id,
                license_id: mockFlights[0].license_id,
                mission_name: mockFlights[0].mission_name,
                status: mockFlights[0].status,
                start_time: mockFlights[0].start_time.toISOString(),
                end_time: mockFlights[0].end_time?.toISOString(),
                createdAt: mockFlights[0].createdAt.toISOString(),
                updatedAt: mockFlights[0].updatedAt.toISOString(),
            });

            expect(mockMissionsService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/missions/active', () => {
        const mockActiveFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Active Flight',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return active flights', async () => {
            mockMissionsService.findActiveFlights.mockResolvedValue(mockActiveFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/active')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].status).toBe(MissionStatus.IN_PROGRESS);
            expect(mockMissionsService.findActiveFlights).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/missions/status/:status', () => {
        const mockFlightsByStatus = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Planned Flight',
                status: MissionStatus.PLANNED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return flights by status', async () => {
            mockMissionsService.findByStatus.mockResolvedValue(mockFlightsByStatus);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/status/planned')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].status).toBe(MissionStatus.PLANNED);
            expect(mockMissionsService.findByStatus).toHaveBeenCalledWith(MissionStatus.PLANNED);
        });
    });

    describe('GET /api/v1/missions/pilot/:pilotId', () => {
        const mockPilotFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Pilot Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return flights by pilot', async () => {
            mockMissionsService.findByPilot.mockResolvedValue(mockPilotFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/pilot/1')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].pilot_id).toBe(1);
            expect(mockMissionsService.findByPilot).toHaveBeenCalledWith('1');
        });
    });

    describe('GET /api/v1/missions/drone/:droneId', () => {
        const mockDroneFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Drone Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return flights by drone', async () => {
            mockMissionsService.findByDrone.mockResolvedValue(mockDroneFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/drone/1')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(mockMissionsService.findByDrone).toHaveBeenCalledWith('1');
        });
    });

    describe('GET /api/v1/missions/date-range', () => {
        const mockDateRangeFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Date Range Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        it('should return flights by date range', async () => {
            mockMissionsService.findFlightsByDateRange.mockResolvedValue(mockDateRangeFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/date-range')
                .query({
                    startDate: '2024-01-01T00:00:00Z',
                    endDate: '2024-01-02T00:00:00Z',
                })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(mockMissionsService.findFlightsByDateRange).toHaveBeenCalledWith(
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-02T00:00:00Z'),
            );
        });
    });

    describe('GET /api/v1/missions/:id', () => {
        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should return flight by ID', async () => {
            mockMissionsService.findById.mockResolvedValue(mockFlight);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/1')
                .expect(200);

            expect(response.body).toEqual({
                id: mockFlight.id,
                pilot_id: mockFlight.pilot_id,
                license_id: mockFlight.license_id,
                mission_name: mockFlight.mission_name,
                status: mockFlight.status,
                start_time: mockFlight.start_time.toISOString(),
                end_time: mockFlight.end_time,
                createdAt: mockFlight.createdAt.toISOString(),
                updatedAt: mockFlight.updatedAt.toISOString(),
            });

            expect(mockMissionsService.findById).toHaveBeenCalledWith('1');
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.findById.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('GET /api/v1/missions/:id/path', () => {
        const mockFlightPath = [
            {
                id: 1,
                mission_id: 1,
                seq_number: 1,
                geo_point: 'POINT(106.6 10.7)',
                altitude_m: 100,
                speed_mps: 10,
                action: 'takeoff',
                createdAt: new Date(),
            },
        ];

        it('should return flight path', async () => {
            mockMissionsService.getFlightPath.mockResolvedValue(mockFlightPath);

            const response = await request(app.getHttpServer())
                .get('/api/v1/missions/1/path')
                .expect(200);

            expect(response.body).toEqual([
                {
                    ...mockFlightPath[0],
                    createdAt: mockFlightPath[0].createdAt.toISOString(),
                },
            ]);
            expect(mockMissionsService.getFlightPath).toHaveBeenCalledWith('1');
        });
    });

    describe('PATCH /api/v1/missions/:id', () => {
        const updateFlightDto = {
            name: 'Updated Flight',
            plannedDuration: 90,
        };

        const mockUpdatedFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Updated Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should update flight successfully', async () => {
            mockMissionsService.update.mockResolvedValue(mockUpdatedFlight);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/1')
                .send(updateFlightDto)
                .expect(200);

            expect(response.body).toEqual({
                id: mockUpdatedFlight.id,
                pilot_id: mockUpdatedFlight.pilot_id,
                license_id: mockUpdatedFlight.license_id,
                mission_name: mockUpdatedFlight.mission_name,
                status: mockUpdatedFlight.status,
                start_time: mockUpdatedFlight.start_time.toISOString(),
                end_time: mockUpdatedFlight.end_time,
                createdAt: mockUpdatedFlight.createdAt.toISOString(),
                updatedAt: mockUpdatedFlight.updatedAt.toISOString(),
            });

            expect(mockMissionsService.update).toHaveBeenCalledWith('1', updateFlightDto);
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.update.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/999')
                .send(updateFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.update).toHaveBeenCalledWith('999', updateFlightDto);
        });
    });

    describe('PATCH /api/v1/missions/:id/start', () => {
        const startFlightDto = {
            actualStartTime: new Date('2024-01-01T08:00:00Z'),
        };

        it('should start flight successfully', async () => {
            mockMissionsService.startFlight.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .patch('/api/v1/missions/1/start')
                .send(startFlightDto)
                .expect(200);

            expect(mockMissionsService.startFlight).toHaveBeenCalledWith('1', {
                ...startFlightDto,
                actualStartTime: startFlightDto.actualStartTime.toISOString(),
            });
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.startFlight.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/999/start')
                .send(startFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.startFlight).toHaveBeenCalledWith('999', {
                ...startFlightDto,
                actualStartTime: startFlightDto.actualStartTime.toISOString(),
            });
        });
    });

    describe('PATCH /api/v1/missions/:id/end', () => {
        const endFlightDto = {
            endLatitude: 10.8,
            endLongitude: 106.7,
            endAltitude: 120,
        };

        it('should end flight successfully', async () => {
            mockMissionsService.endFlight.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .patch('/api/v1/missions/1/end')
                .send(endFlightDto)
                .expect(200);

            expect(mockMissionsService.endFlight).toHaveBeenCalledWith('1', endFlightDto);
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.endFlight.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/missions/999/end')
                .send(endFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.endFlight).toHaveBeenCalledWith('999', endFlightDto);
        });
    });

    describe('POST /api/v1/missions/:id/path-point', () => {
        const addPathPointDto = {
            latitude: 10.7,
            longitude: 106.6,
            altitude: 100,
            speed: 10,
            batteryLevel: 95,
        };

        const mockPathPoint = {
            id: 1,
            mission_id: 1,
            seq_number: 1,
            geo_point: 'POINT(106.6 10.7)',
            altitude_m: 100,
            speed_mps: 10,
            action: 'waypoint',
            createdAt: new Date(),
        };

        it('should add path point successfully', async () => {
            mockMissionsService.addPathPoint.mockResolvedValue(mockPathPoint);

            const response = await request(app.getHttpServer())
                .post('/api/v1/missions/1/path-point')
                .send(addPathPointDto)
                .expect(201);

            expect(response.body).toEqual({
                ...mockPathPoint,
                createdAt: mockPathPoint.createdAt.toISOString(),
            });
            expect(mockMissionsService.addPathPoint).toHaveBeenCalledWith('1', addPathPointDto);
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.addPathPoint.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/missions/999/path-point')
                .send(addPathPointDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.addPathPoint).toHaveBeenCalledWith('999', addPathPointDto);
        });
    });

    describe('DELETE /api/v1/missions/:id', () => {
        it('should delete flight successfully', async () => {
            mockMissionsService.delete.mockResolvedValue(undefined);

            await request(app.getHttpServer()).delete('/api/v1/missions/1').expect(200);

            expect(mockMissionsService.delete).toHaveBeenCalledWith('1');
        });

        it('should return 404 when flight not found', async () => {
            mockMissionsService.delete.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .delete('/api/v1/missions/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockMissionsService.delete).toHaveBeenCalledWith('999');
        });
    });
});
