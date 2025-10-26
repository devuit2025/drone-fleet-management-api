import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DroneSensorsController } from './drone-sensors.controller';
import { DroneSensorsService } from './drone-sensors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DroneSensorResponseDto } from './dto';
import { SensorStatus } from '../../entities/drone-sensor.entity';

describe('DroneSensorsController', () => {
  let app: INestApplication;
  let droneSensorsService: DroneSensorsService;
  let module: TestingModule;

  const mockDroneSensorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByDroneId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [DroneSensorsController],
      providers: [
        {
          provide: DroneSensorsService,
          useValue: mockDroneSensorsService,
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

    droneSensorsService = module.get<DroneSensorsService>(DroneSensorsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/drone-sensors', () => {
    it('should create a new drone sensor', async () => {
      const createDroneSensorDto = {
        droneId: 1,
        type: 'camera',
        model: 'HD Camera',
        resolution: '4K',
        fieldOfView: 120,
        status: SensorStatus.ACTIVE,
      };
      const mockDroneSensor = new DroneSensorResponseDto({
        id: 1,
        ...createDroneSensorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneSensorsService.create.mockResolvedValue(mockDroneSensor);

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-sensors')
        .send(createDroneSensorDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(createDroneSensorDto.type);
      expect(mockDroneSensorsService.create).toHaveBeenCalledWith(createDroneSensorDto);
    });

    it('should return 400 when type is too short', async () => {
      const createDroneSensorDto = {
        droneId: 1,
        type: 'A',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-sensors')
        .send(createDroneSensorDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('type'))).toBe(true);
    });

    it('should return 400 when droneId is missing', async () => {
      const createDroneSensorDto = {
        type: 'camera',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-sensors')
        .send(createDroneSensorDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('droneId'))).toBe(true);
    });
  });

  describe('GET /api/v1/drone-sensors', () => {
    it('should return an array of drone sensors', async () => {
      const mockDroneSensors = [
        new DroneSensorResponseDto({
          id: 1,
          droneId: 1,
          type: 'camera',
          model: 'HD Camera',
          resolution: '4K',
          fieldOfView: 120,
          status: SensorStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
      ];

      mockDroneSensorsService.findAll.mockResolvedValue(mockDroneSensors);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-sensors')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(mockDroneSensorsService.findAll).toHaveBeenCalled();
    });

    it('should return sensors for specific drone', async () => {
      const mockDroneSensors = [
        new DroneSensorResponseDto({
          id: 1,
          droneId: 1,
          type: 'camera',
          model: 'HD Camera',
          resolution: '4K',
          fieldOfView: 120,
          status: SensorStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
      ];

      mockDroneSensorsService.findByDroneId.mockResolvedValue(mockDroneSensors);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-sensors?droneId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(mockDroneSensorsService.findByDroneId).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/drone-sensors/:id', () => {
    it('should return a drone sensor by ID', async () => {
      const mockDroneSensor = new DroneSensorResponseDto({
        id: 1,
        droneId: 1,
        type: 'camera',
        model: 'HD Camera',
        resolution: '4K',
        fieldOfView: 120,
        status: SensorStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneSensorsService.findById.mockResolvedValue(mockDroneSensor);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-sensors/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.type).toBe('camera');
      expect(mockDroneSensorsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone sensor not found', async () => {
      mockDroneSensorsService.findById.mockRejectedValue(
        new HttpException('Drone sensor not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-sensors/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/drone-sensors/:id', () => {
    it('should update a drone sensor successfully', async () => {
      const updateDroneSensorDto = {
        status: SensorStatus.INACTIVE,
      };
      const mockDroneSensor = new DroneSensorResponseDto({
        id: 1,
        droneId: 1,
        type: 'camera',
        status: SensorStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneSensorsService.update.mockResolvedValue(mockDroneSensor);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-sensors/1')
        .send(updateDroneSensorDto)
        .expect(200);

      expect(response.body.status).toBe(SensorStatus.INACTIVE);
      expect(mockDroneSensorsService.update).toHaveBeenCalledWith(1, updateDroneSensorDto);
    });

    it('should return 404 when drone sensor not found', async () => {
      mockDroneSensorsService.update.mockRejectedValue(
        new HttpException('Drone sensor not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-sensors/999')
        .send({ status: SensorStatus.FAULTY })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/drone-sensors/:id', () => {
    it('should delete a drone sensor successfully', async () => {
      mockDroneSensorsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/drone-sensors/1')
        .expect(200);

      expect(mockDroneSensorsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone sensor not found', async () => {
      mockDroneSensorsService.delete.mockRejectedValue(
        new HttpException('Drone sensor not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/drone-sensors/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});
