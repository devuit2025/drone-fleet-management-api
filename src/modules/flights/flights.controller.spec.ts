import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MissionStatus } from '../../entities/mission.entity';

describe('FlightsController', () => {
    let app: INestApplication;
    let flightsService: FlightsService;
    let module: TestingModule;

    const mockFlightsService = {
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
            controllers: [FlightsController],
            providers: [
                {
                    provide: FlightsService,
                    useValue: mockFlightsService,
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

        flightsService = module.get<FlightsService>(FlightsService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('POST /api/v1/flights', () => {
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
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should create a new flight successfully', async () => {
            mockFlightsService.create.mockResolvedValue(mockFlight);

            const response = await request(app.getHttpServer())
                .post('/api/v1/flights')
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
                created_at: mockFlight.created_at.toISOString(),
                updated_at: mockFlight.updated_at.toISOString(),
            });

            expect(mockFlightsService.create).toHaveBeenCalledWith(createFlightDto);
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

            await request(app.getHttpServer()).post('/api/v1/flights').send(invalidDto).expect(400);
        });
    });

    describe('GET /api/v1/flights', () => {
        const mockFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Flight 1',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                pilot_id: 2,
                license_id: 2,
                mission_name: 'Flight 2',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-02T09:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return all flights', async () => {
            mockFlightsService.findAll.mockResolvedValue(mockFlights);

            const response = await request(app.getHttpServer()).get('/api/v1/flights').expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toEqual({
                id: mockFlights[0].id,
                pilot_id: mockFlights[0].pilot_id,
                license_id: mockFlights[0].license_id,
                mission_name: mockFlights[0].mission_name,
                status: mockFlights[0].status,
                start_time: mockFlights[0].start_time.toISOString(),
                end_time: mockFlights[0].end_time?.toISOString(),
                created_at: mockFlights[0].created_at.toISOString(),
                updated_at: mockFlights[0].updated_at.toISOString(),
            });

            expect(mockFlightsService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/flights/active', () => {
        const mockActiveFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Active Flight',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return active flights', async () => {
            mockFlightsService.findActiveFlights.mockResolvedValue(mockActiveFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/active')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].status).toBe(MissionStatus.IN_PROGRESS);
            expect(mockFlightsService.findActiveFlights).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/flights/status/:status', () => {
        const mockFlightsByStatus = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Planned Flight',
                status: MissionStatus.PLANNED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by status', async () => {
            mockFlightsService.findByStatus.mockResolvedValue(mockFlightsByStatus);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/status/planned')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].status).toBe(MissionStatus.PLANNED);
            expect(mockFlightsService.findByStatus).toHaveBeenCalledWith(MissionStatus.PLANNED);
        });
    });

    describe('GET /api/v1/flights/pilot/:pilotId', () => {
        const mockPilotFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Pilot Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by pilot', async () => {
            mockFlightsService.findByPilot.mockResolvedValue(mockPilotFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/pilot/1')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].pilot_id).toBe(1);
            expect(mockFlightsService.findByPilot).toHaveBeenCalledWith('1');
        });
    });

    describe('GET /api/v1/flights/drone/:droneId', () => {
        const mockDroneFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Drone Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by drone', async () => {
            mockFlightsService.findByDrone.mockResolvedValue(mockDroneFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/drone/1')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(mockFlightsService.findByDrone).toHaveBeenCalledWith('1');
        });
    });

    describe('GET /api/v1/flights/date-range', () => {
        const mockDateRangeFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Date Range Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by date range', async () => {
            mockFlightsService.findFlightsByDateRange.mockResolvedValue(mockDateRangeFlights);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/date-range')
                .query({
                    startDate: '2024-01-01T00:00:00Z',
                    endDate: '2024-01-02T00:00:00Z',
                })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(mockFlightsService.findFlightsByDateRange).toHaveBeenCalledWith(
                new Date('2024-01-01T00:00:00Z'),
                new Date('2024-01-02T00:00:00Z'),
            );
        });
    });

    describe('GET /api/v1/flights/:id', () => {
        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should return flight by ID', async () => {
            mockFlightsService.findById.mockResolvedValue(mockFlight);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/1')
                .expect(200);

            expect(response.body).toEqual({
                id: mockFlight.id,
                pilot_id: mockFlight.pilot_id,
                license_id: mockFlight.license_id,
                mission_name: mockFlight.mission_name,
                status: mockFlight.status,
                start_time: mockFlight.start_time.toISOString(),
                end_time: mockFlight.end_time,
                created_at: mockFlight.created_at.toISOString(),
                updated_at: mockFlight.updated_at.toISOString(),
            });

            expect(mockFlightsService.findById).toHaveBeenCalledWith('1');
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.findById.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('GET /api/v1/flights/:id/path', () => {
        const mockFlightPath = [
            {
                id: 1,
                mission_id: 1,
                seq_number: 1,
                geo_point: 'POINT(106.6 10.7)',
                altitude_m: 100,
                speed_mps: 10,
                action: 'takeoff',
                created_at: new Date(),
            },
        ];

        it('should return flight path', async () => {
            mockFlightsService.getFlightPath.mockResolvedValue(mockFlightPath);

            const response = await request(app.getHttpServer())
                .get('/api/v1/flights/1/path')
                .expect(200);

            expect(response.body).toEqual([
                {
                    ...mockFlightPath[0],
                    created_at: mockFlightPath[0].created_at.toISOString(),
                },
            ]);
            expect(mockFlightsService.getFlightPath).toHaveBeenCalledWith('1');
        });
    });

    describe('PATCH /api/v1/flights/:id', () => {
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
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should update flight successfully', async () => {
            mockFlightsService.update.mockResolvedValue(mockUpdatedFlight);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/flights/1')
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
                created_at: mockUpdatedFlight.created_at.toISOString(),
                updated_at: mockUpdatedFlight.updated_at.toISOString(),
            });

            expect(mockFlightsService.update).toHaveBeenCalledWith('1', updateFlightDto);
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.update.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/flights/999')
                .send(updateFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.update).toHaveBeenCalledWith('999', updateFlightDto);
        });
    });

    describe('PATCH /api/v1/flights/:id/start', () => {
        const startFlightDto = {
            actualStartTime: new Date('2024-01-01T08:00:00Z'),
        };

        it('should start flight successfully', async () => {
            mockFlightsService.startFlight.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .patch('/api/v1/flights/1/start')
                .send(startFlightDto)
                .expect(200);

            expect(mockFlightsService.startFlight).toHaveBeenCalledWith('1', {
                ...startFlightDto,
                actualStartTime: startFlightDto.actualStartTime.toISOString(),
            });
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.startFlight.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/flights/999/start')
                .send(startFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.startFlight).toHaveBeenCalledWith('999', {
                ...startFlightDto,
                actualStartTime: startFlightDto.actualStartTime.toISOString(),
            });
        });
    });

    describe('PATCH /api/v1/flights/:id/end', () => {
        const endFlightDto = {
            endLatitude: 10.8,
            endLongitude: 106.7,
            endAltitude: 120,
        };

        it('should end flight successfully', async () => {
            mockFlightsService.endFlight.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .patch('/api/v1/flights/1/end')
                .send(endFlightDto)
                .expect(200);

            expect(mockFlightsService.endFlight).toHaveBeenCalledWith('1', endFlightDto);
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.endFlight.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/flights/999/end')
                .send(endFlightDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.endFlight).toHaveBeenCalledWith('999', endFlightDto);
        });
    });

    describe('POST /api/v1/flights/:id/path-point', () => {
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
            created_at: new Date(),
        };

        it('should add path point successfully', async () => {
            mockFlightsService.addPathPoint.mockResolvedValue(mockPathPoint);

            const response = await request(app.getHttpServer())
                .post('/api/v1/flights/1/path-point')
                .send(addPathPointDto)
                .expect(201);

            expect(response.body).toEqual({
                ...mockPathPoint,
                created_at: mockPathPoint.created_at.toISOString(),
            });
            expect(mockFlightsService.addPathPoint).toHaveBeenCalledWith('1', addPathPointDto);
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.addPathPoint.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/flights/999/path-point')
                .send(addPathPointDto)
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.addPathPoint).toHaveBeenCalledWith('999', addPathPointDto);
        });
    });

    describe('DELETE /api/v1/flights/:id', () => {
        it('should delete flight successfully', async () => {
            mockFlightsService.delete.mockResolvedValue(undefined);

            await request(app.getHttpServer()).delete('/api/v1/flights/1').expect(200);

            expect(mockFlightsService.delete).toHaveBeenCalledWith('1');
        });

        it('should return 404 when flight not found', async () => {
            mockFlightsService.delete.mockRejectedValue(
                new HttpException('Flight not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .delete('/api/v1/flights/999')
                .expect(404);

            expect(response.body).toEqual({
                message: 'Flight not found',
                statusCode: 404,
            });

            expect(mockFlightsService.delete).toHaveBeenCalledWith('999');
        });
    });
});
