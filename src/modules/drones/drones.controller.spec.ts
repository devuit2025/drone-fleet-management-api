import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DronesController } from './drones.controller';
import { DronesService } from './drones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DroneStatus } from '../../entities/drone.entity';

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
      .useValue(mockJwtAuthGuard)
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
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
    };

    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create a new drone successfully', async () => {
      mockDronesService.create.mockResolvedValue(mockDrone);

      const response = await request(app.getHttpServer())
        .post('/api/v1/drones')
        .send(createDroneDto)
        .expect(201);

      expect(response.body).toEqual({
        id: mockDrone.id,
        name: mockDrone.name,
        model: mockDrone.model,
        serial_number: mockDrone.serial_number,
        status: mockDrone.status,
        max_payload: mockDrone.max_payload,
        battery_capacity: mockDrone.battery_capacity,
        last_maintenance: mockDrone.last_maintenance.toISOString(),
        created_at: mockDrone.created_at.toISOString(),
        updated_at: mockDrone.updated_at.toISOString(),
      });

      expect(mockDronesService.create).toHaveBeenCalledWith({
        ...createDroneDto,
        last_maintenance: createDroneDto.last_maintenance.toISOString(),
      });
    });

    it('should return 409 when drone already exists', async () => {
      mockDronesService.create.mockRejectedValue(
        new HttpException('Drone with this serial number already exists', HttpStatus.CONFLICT)
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/drones')
        .send(createDroneDto)
        .expect(409);

      expect(response.body).toEqual({
        message: 'Drone with this serial number already exists',
        statusCode: 409,
      });

      expect(mockDronesService.create).toHaveBeenCalledWith({
        ...createDroneDto,
        last_maintenance: createDroneDto.last_maintenance.toISOString(),
      });
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        name: 'Test',
        model: 'DJI',
        serial_number: 'DRONE-001',
        max_payload: -100, // negative value
        battery_capacity: -50, // negative value
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drones')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toEqual([
        'max_payload must not be less than 0',
        'battery_capacity must not be less than 0',
      ]);
    });
  });

  describe('GET /api/v1/drones', () => {
    const mockDrones = [
      {
        id: 1,
        name: 'Drone 1',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.AVAILABLE,
        max_payload: 1000,
        battery_capacity: 100,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Drone 2',
        model: 'DJI Mavic Pro',
        serial_number: 'DRONE-002',
        status: DroneStatus.IN_MISSION,
        max_payload: 500,
        battery_capacity: 85,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return all drones', async () => {
      mockDronesService.findAll.mockResolvedValue(mockDrones);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drones')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        id: mockDrones[0].id,
        name: mockDrones[0].name,
        model: mockDrones[0].model,
        serial_number: mockDrones[0].serial_number,
        status: mockDrones[0].status,
        max_payload: mockDrones[0].max_payload,
        battery_capacity: mockDrones[0].battery_capacity,
        last_maintenance: mockDrones[0].last_maintenance.toISOString(),
        created_at: mockDrones[0].created_at.toISOString(),
        updated_at: mockDrones[0].updated_at.toISOString(),
      });

      expect(mockDronesService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/drones/available', () => {
    const mockAvailableDrones = [
      {
        id: 1,
        name: 'Available Drone',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.AVAILABLE,
        max_payload: 1000,
        battery_capacity: 100,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return available drones', async () => {
      mockDronesService.findAvailableDrones.mockResolvedValue(mockAvailableDrones);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drones/available')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe(DroneStatus.AVAILABLE);
      expect(mockDronesService.findAvailableDrones).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/drones/status/:status', () => {
    const mockDronesByStatus = [
      {
        id: 1,
        name: 'Maintenance Drone',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.MAINTENANCE,
        max_payload: 1000,
        battery_capacity: 50,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return drones by status', async () => {
      mockDronesService.findByStatus.mockResolvedValue(mockDronesByStatus);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drones/status/maintenance')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe(DroneStatus.MAINTENANCE);
      expect(mockDronesService.findByStatus).toHaveBeenCalledWith(DroneStatus.MAINTENANCE);
    });
  });

  describe('GET /api/v1/drones/:id', () => {
    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return drone by ID', async () => {
      mockDronesService.findById.mockResolvedValue(mockDrone);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drones/1')
        .expect(200);

      expect(response.body).toEqual({
        id: mockDrone.id,
        name: mockDrone.name,
        model: mockDrone.model,
        serial_number: mockDrone.serial_number,
        status: mockDrone.status,
        max_payload: mockDrone.max_payload,
        battery_capacity: mockDrone.battery_capacity,
        last_maintenance: mockDrone.last_maintenance.toISOString(),
        created_at: mockDrone.created_at.toISOString(),
        updated_at: mockDrone.updated_at.toISOString(),
      });

      expect(mockDronesService.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when drone not found', async () => {
      mockDronesService.findById.mockRejectedValue(
        new HttpException('Drone not found', HttpStatus.NOT_FOUND)
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/drones/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Drone not found',
        statusCode: 404,
      });

      expect(mockDronesService.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('PATCH /api/v1/drones/:id', () => {
    const updateDroneDto = {
      name: 'Updated Drone',
      battery_capacity: 90,
    };

    const mockUpdatedDrone = {
      id: 1,
      name: 'Updated Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 90,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update drone successfully', async () => {
      mockDronesService.update.mockResolvedValue(mockUpdatedDrone);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drones/1')
        .send(updateDroneDto)
        .expect(200);

      expect(response.body).toEqual({
        id: mockUpdatedDrone.id,
        name: mockUpdatedDrone.name,
        model: mockUpdatedDrone.model,
        serial_number: mockUpdatedDrone.serial_number,
        status: mockUpdatedDrone.status,
        max_payload: mockUpdatedDrone.max_payload,
        battery_capacity: mockUpdatedDrone.battery_capacity,
        last_maintenance: mockUpdatedDrone.last_maintenance.toISOString(),
        created_at: mockUpdatedDrone.created_at.toISOString(),
        updated_at: mockUpdatedDrone.updated_at.toISOString(),
      });

      expect(mockDronesService.update).toHaveBeenCalledWith('1', updateDroneDto);
    });

    it('should return 404 when drone not found', async () => {
      mockDronesService.update.mockRejectedValue(
        new HttpException('Drone not found', HttpStatus.NOT_FOUND)
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drones/999')
        .send(updateDroneDto)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Drone not found',
        statusCode: 404,
      });

      expect(mockDronesService.update).toHaveBeenCalledWith('999', updateDroneDto);
    });
  });

  describe('PATCH /api/v1/drones/:id/status', () => {
    const updateStatusDto = {
      status: DroneStatus.IN_MISSION,
      battery_capacity: 85,
    };

    it('should update drone status successfully', async () => {
      mockDronesService.updateStatus.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/api/v1/drones/1/status')
        .send(updateStatusDto)
        .expect(200);

      expect(mockDronesService.updateStatus).toHaveBeenCalledWith('1', updateStatusDto);
    });

    it('should return 404 when drone not found', async () => {
      mockDronesService.updateStatus.mockRejectedValue(
        new HttpException('Drone not found', HttpStatus.NOT_FOUND)
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drones/999/status')
        .send(updateStatusDto)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Drone not found',
        statusCode: 404,
      });

      expect(mockDronesService.updateStatus).toHaveBeenCalledWith('999', updateStatusDto);
    });
  });

  describe('DELETE /api/v1/drones/:id', () => {
    it('should delete drone successfully', async () => {
      mockDronesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/drones/1')
        .expect(200);

      expect(mockDronesService.delete).toHaveBeenCalledWith('1');
    });

    it('should return 404 when drone not found', async () => {
      mockDronesService.delete.mockRejectedValue(
        new HttpException('Drone not found', HttpStatus.NOT_FOUND)
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/drones/999')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Drone not found',
        statusCode: 404,
      });

      expect(mockDronesService.delete).toHaveBeenCalledWith('999');
    });
  });
});
