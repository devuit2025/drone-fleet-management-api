import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DronesController } from './drones.controller';
import { DronesService } from './drones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DroneStatus } from '../../entities/drone.entity';
import { DroneResponseDto } from './dto';

describe('DronesController', () => {
    let app: INestApplication;
    let dronesService: DronesService;
    let module: TestingModule;

    const mockDronesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByStatus: jest.fn(),
        findAvailableDrones: jest.fn(),
        updateStatus: jest.fn(),
    };

    const mockJwtAuthGuard = {
        canActivate: jest.fn().mockReturnValue(true),
    };

    beforeEach(async () => {
        jest.resetAllMocks();
        jest.clearAllMocks();

        module = await Test.createTestingModule({
            controllers: [DronesController],
            providers: [
                {
                    provide: DronesService,
                    useValue: mockDronesService,
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

        dronesService = module.get<DronesService>(DronesService);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('POST /api/v1/drones', () => {
        const createDroneDto = {
            modelId: 1,
            name: 'Test Drone',
            serialNumber: 'DRONE-001',
            status: DroneStatus.AVAILABLE,
            firmwareVersion: '1.0.0',
            batteryHealth: 85,
            totalFlightHours: 0,
            lastMaintenance: new Date(),
        };

        const mockDrone = {
            id: 1,
            modelId: 1,
            name: 'Test Drone',
            serialNumber: 'DRONE-001',
            status: DroneStatus.AVAILABLE,
            firmwareVersion: '1.0.0',
            batteryHealth: 85,
            totalFlightHours: 0,
            lastMaintenance: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should create a new drone successfully', async () => {
            mockDronesService.create.mockResolvedValue(mockDrone);

            const response = await request(app.getHttpServer())
                .post('/api/v1/drones')
                .send(createDroneDto)
                .expect(201);

            expect(response.body).toEqual({
                id: mockDrone.id,
                modelId: mockDrone.modelId,
                name: mockDrone.name,
                serialNumber: mockDrone.serialNumber,
                status: mockDrone.status,
                firmwareVersion: mockDrone.firmwareVersion,
                batteryHealth: mockDrone.batteryHealth,
                totalFlightHours: mockDrone.totalFlightHours,
                lastMaintenance: mockDrone.lastMaintenance.toISOString(),
                createdAt: mockDrone.createdAt.toISOString(),
                updatedAt: mockDrone.updatedAt.toISOString(),
            });

            expect(mockDronesService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    modelId: createDroneDto.modelId,
                    name: createDroneDto.name,
                    serialNumber: createDroneDto.serialNumber,
                    status: createDroneDto.status,
                    firmwareVersion: createDroneDto.firmwareVersion,
                    batteryHealth: createDroneDto.batteryHealth,
                    totalFlightHours: createDroneDto.totalFlightHours,
                }),
            );
        });

        it('should return 400 when required fields are missing', async () => {
            const invalidDto = {
                serialNumber: 'DRONE-001',
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/drones')
                .send(invalidDto)
                .expect(400);

            expect(response.body.message).toBeDefined();
        });

        it('should return 409 when drone with serial number already exists', async () => {
            mockDronesService.create.mockRejectedValue(
                new HttpException('Drone with this serial number already exists', HttpStatus.CONFLICT),
            );

            const response = await request(app.getHttpServer())
                .post('/api/v1/drones')
                .send(createDroneDto)
                .expect(409);

            expect(response.body.statusCode).toBe(409);
        });
    });

    describe('GET /api/v1/drones', () => {
        it('should return an array of drones', async () => {
            const mockDrones = [
                new DroneResponseDto({
                    id: 1,
                    modelId: 1,
                    name: 'Test Drone',
                    serialNumber: 'DRONE-001',
                    status: DroneStatus.AVAILABLE,
                    firmwareVersion: '1.0.0',
                    batteryHealth: 85,
                    totalFlightHours: 0,
                    lastMaintenance: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any),
            ];

            mockDronesService.findAll.mockResolvedValue(mockDrones);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(mockDronesService.findAll).toHaveBeenCalled();
        });

        it('should return filtered drones by searchable serialNumber field', async () => {
            const mockDrones = [
                new DroneResponseDto({
                    id: 1,
                    modelId: 1,
                    name: 'Explorer Drone',
                    serialNumber: 'DRN-001',
                    status: DroneStatus.AVAILABLE,
                    firmwareVersion: '1.0.0',
                    batteryHealth: 98,
                    totalFlightHours: 150,
                    lastMaintenance: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any),
            ];

            mockDronesService.findAll.mockResolvedValue(mockDrones);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones')
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].serialNumber).toBe('DRN-001');
            expect(mockDronesService.findAll).toHaveBeenCalled();
        });

        it('should return filtered drones by searchable name field', async () => {
            const mockDrones = [
                new DroneResponseDto({
                    id: 1,
                    modelId: 1,
                    name: 'Surveyor Drone',
                    serialNumber: 'DRN-002',
                    status: DroneStatus.AVAILABLE,
                    firmwareVersion: '1.1.0',
                    batteryHealth: 95,
                    totalFlightHours: 200,
                    lastMaintenance: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any),
            ];

            mockDronesService.findAll.mockResolvedValue(mockDrones);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones')
                .expect(200);

            expect(response.body.length).toBe(1);
            expect(response.body[0].name).toContain('Surveyor');
            expect(mockDronesService.findAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/drones/:id', () => {
        it('should return a drone by ID', async () => {
            const mockDrone = new DroneResponseDto({
                id: 1,
                modelId: 1,
                name: 'Test Drone',
                serialNumber: 'DRONE-001',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 85,
                totalFlightHours: 0,
                lastMaintenance: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            mockDronesService.findById.mockResolvedValue(mockDrone);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones/1')
                .expect(200);

            expect(response.body.id).toBe(1);
            expect(response.body.name).toBe('Test Drone');
            expect(mockDronesService.findById).toHaveBeenCalledWith(1);
        });

        it('should return drone by ID with model, sensors, and telemetry relations loaded', async () => {
            const mockDroneWithRelations = new DroneResponseDto({
                id: 1,
                modelId: 1,
                name: 'Test Drone',
                serialNumber: 'DRONE-001',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 85,
                totalFlightHours: 0,
                lastMaintenance: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                model: { id: 1, name: 'DJI Mavic 3', brandId: 1, categoryId: 1 },
                sensors: [
                    { id: 1, type: 'camera', model: 'DJI Camera', droneId: 1, status: 'active' },
                    { id: 2, type: 'gps', model: 'GPS Module', droneId: 1, status: 'active' },
                ],
                telemetry: [
                    { id: 1, droneId: 1, missionId: 1, timestamp: new Date(), altitudeM: 100, speedMps: 10, batteryPct: 80, status: 'flying' },
                    { id: 2, droneId: 1, missionId: 1, timestamp: new Date(), altitudeM: 150, speedMps: 15, batteryPct: 75, status: 'flying' },
                ],
            } as any);

            mockDronesService.findById.mockResolvedValue(mockDroneWithRelations);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones/1')
                .expect(200);

            expect(response.body.id).toBe(1);
            // Verify that relations are included in response with all attributes
            expect(response.body.model).toBeDefined();
            expect(response.body.model).toHaveProperty('id');
            expect(response.body.model).toHaveProperty('name');
            expect(response.body.model).toHaveProperty('brandId');
            expect(response.body.model).toHaveProperty('categoryId');
            expect(response.body.model.name).toBe('DJI Mavic 3');

            expect(response.body.sensors).toBeDefined();
            expect(Array.isArray(response.body.sensors)).toBe(true);
            expect(response.body.sensors.length).toBe(2);
            expect(response.body.sensors[0]).toHaveProperty('id');
            expect(response.body.sensors[0]).toHaveProperty('type');
            expect(response.body.sensors[0]).toHaveProperty('model');
            expect(response.body.sensors[0]).toHaveProperty('droneId');
            expect(response.body.sensors[0]).toHaveProperty('status');
            expect(response.body.sensors[0].type).toBe('camera');
            expect(response.body.sensors[0].model).toBe('DJI Camera');
            expect(response.body.sensors[1].type).toBe('gps');
            expect(response.body.sensors[1].model).toBe('GPS Module');

            expect(response.body.telemetry).toBeDefined();
            expect(Array.isArray(response.body.telemetry)).toBe(true);
            expect(response.body.telemetry.length).toBe(2);
            expect(response.body.telemetry[0]).toHaveProperty('id');
            expect(response.body.telemetry[0]).toHaveProperty('droneId');
            expect(response.body.telemetry[0]).toHaveProperty('missionId');
            expect(response.body.telemetry[0]).toHaveProperty('timestamp');
            expect(response.body.telemetry[0]).toHaveProperty('altitudeM');
            expect(response.body.telemetry[0]).toHaveProperty('speedMps');
            expect(response.body.telemetry[0]).toHaveProperty('batteryPct');
            expect(response.body.telemetry[0]).toHaveProperty('status');
            expect(response.body.telemetry[0].altitudeM).toBe(100);
            expect(response.body.telemetry[0].speedMps).toBe(10);
            expect(response.body.telemetry[0].batteryPct).toBe(80);
            expect(response.body.telemetry[1].altitudeM).toBe(150);
            expect(response.body.telemetry[1].speedMps).toBe(15);
            expect(response.body.telemetry[1].batteryPct).toBe(75);

            expect(mockDronesService.findById).toHaveBeenCalledWith(1);
        });

        it('should return 404 when drone not found', async () => {
            mockDronesService.findById.mockRejectedValue(
                new HttpException('Drone not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones/999')
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/v1/drones/:id', () => {
        it('should update a drone successfully', async () => {
            const updateDroneDto = {
                name: 'Updated Drone',
                status: DroneStatus.MAINTENANCE,
            };

            const mockDrone = new DroneResponseDto({
                id: 1,
                modelId: 1,
                name: 'Updated Drone',
                serialNumber: 'DRONE-001',
                status: DroneStatus.MAINTENANCE,
                firmwareVersion: '1.0.0',
                batteryHealth: 85,
                totalFlightHours: 0,
                lastMaintenance: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            mockDronesService.update.mockResolvedValue(mockDrone);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/drones/1')
                .send(updateDroneDto)
                .expect(200);

            expect(response.body.name).toBe('Updated Drone');
            expect(response.body.status).toBe(DroneStatus.MAINTENANCE);
            expect(mockDronesService.update).toHaveBeenCalledWith(1, updateDroneDto);
        });

        it('should return 404 when drone not found', async () => {
            mockDronesService.update.mockRejectedValue(
                new HttpException('Drone not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .patch('/api/v1/drones/999')
                .send({ name: 'Updated' })
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/v1/drones/:id', () => {
        it('should delete a drone successfully', async () => {
            mockDronesService.delete.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .delete('/api/v1/drones/1')
                .expect(200);

            expect(mockDronesService.delete).toHaveBeenCalledWith(1);
        });

        it('should return 404 when drone not found', async () => {
            mockDronesService.delete.mockRejectedValue(
                new HttpException('Drone not found', HttpStatus.NOT_FOUND),
            );

            const response = await request(app.getHttpServer())
                .delete('/api/v1/drones/999')
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });
    });

    describe('GET /api/v1/drones/status/:status', () => {
        it('should return drones by status', async () => {
            const mockDrones = [
                new DroneResponseDto({
                    id: 1,
                    modelId: 1,
                    name: 'Test Drone',
                    serialNumber: 'DRONE-001',
                    status: DroneStatus.AVAILABLE,
                    firmwareVersion: '1.0.0',
                    batteryHealth: 85,
                    totalFlightHours: 0,
                    lastMaintenance: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any),
            ];

            mockDronesService.findByStatus.mockResolvedValue(mockDrones);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones/status/available')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(mockDronesService.findByStatus).toHaveBeenCalledWith('available');
        });
    });

    describe('GET /api/v1/drones/available', () => {
        it('should return available drones', async () => {
            const mockDrones = [
                new DroneResponseDto({
                    id: 1,
                    modelId: 1,
                    name: 'Test Drone',
                    serialNumber: 'DRONE-001',
                    status: DroneStatus.AVAILABLE,
                    firmwareVersion: '1.0.0',
                    batteryHealth: 85,
                    totalFlightHours: 0,
                    lastMaintenance: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any),
            ];

            mockDronesService.findAvailableDrones.mockResolvedValue(mockDrones);

            const response = await request(app.getHttpServer())
                .get('/api/v1/drones/available')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(mockDronesService.findAvailableDrones).toHaveBeenCalled();
        });
    });

    describe('PATCH /api/v1/drones/:id/status', () => {
        it('should update drone status successfully', async () => {
            const updateStatusDto = {
                status: DroneStatus.MAINTENANCE,
            };

            mockDronesService.updateStatus.mockResolvedValue(undefined);

            const response = await request(app.getHttpServer())
                .patch('/api/v1/drones/1/status')
                .send(updateStatusDto)
                .expect(200);

            expect(response.body).toEqual({});
            expect(mockDronesService.updateStatus).toHaveBeenCalledWith(1, updateStatusDto);
        });
    });
});
