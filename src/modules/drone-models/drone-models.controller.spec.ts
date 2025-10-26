import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DroneModelsController } from './drone-models.controller';
import { DroneModelsService } from './drone-models.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DroneModelResponseDto } from './dto';

describe('DroneModelsController', () => {
  let app: INestApplication;
  let droneModelsService: DroneModelsService;
  let module: TestingModule;

  const mockDroneModelsService = {
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
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [DroneModelsController],
      providers: [
        {
          provide: DroneModelsService,
          useValue: mockDroneModelsService,
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

    droneModelsService = module.get<DroneModelsService>(DroneModelsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/drone-models', () => {
    it('should create a new drone model', async () => {
      const createDroneModelDto = {
        brandId: 1,
        categoryId: 1,
        name: 'DJI Mavic 3',
        maxSpeed: 75,
        maxAltitude: 8000,
        maxFlightTime: 46,
        maxPayload: 895,
        batteryCapacity: 5000,
      };
      const mockDroneModel = new DroneModelResponseDto({
        id: 1,
        ...createDroneModelDto,
        dimensions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneModelsService.create.mockResolvedValue(mockDroneModel);

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-models')
        .send(createDroneModelDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDroneModelDto.name);
      expect(mockDroneModelsService.create).toHaveBeenCalledWith(createDroneModelDto);
    });

    it('should return 400 when name is too short', async () => {
      const createDroneModelDto = {
        brandId: 1,
        categoryId: 1,
        name: 'A',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-models')
        .send(createDroneModelDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('name'))).toBe(true);
    });

    it('should return 400 when brandId is missing', async () => {
      const createDroneModelDto = {
        categoryId: 1,
        name: 'Test Model',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-models')
        .send(createDroneModelDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('brandId'))).toBe(true);
    });

    it('should return 409 when model name already exists', async () => {
      mockDroneModelsService.create.mockRejectedValue(
        new HttpException('Model with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-models')
        .send({ brandId: 1, categoryId: 1, name: 'DJI Mavic 3' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/drone-models', () => {
    it('should return an array of drone models', async () => {
      const mockDroneModels = [
        new DroneModelResponseDto({
          id: 1,
          brandId: 1,
          categoryId: 1,
          name: 'DJI Mavic 3',
          maxSpeed: 75,
          maxAltitude: 8000,
          maxFlightTime: 46,
          maxPayload: 895,
          batteryCapacity: 5000,
          dimensions: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
      ];

      mockDroneModelsService.findAll.mockResolvedValue(mockDroneModels);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-models')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(mockDroneModelsService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/drone-models/:id', () => {
    it('should return a drone model by ID', async () => {
      const mockDroneModel = new DroneModelResponseDto({
        id: 1,
        brandId: 1,
        categoryId: 1,
        name: 'DJI Mavic 3',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneModelsService.findById.mockResolvedValue(mockDroneModel);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-models/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('DJI Mavic 3');
      expect(mockDroneModelsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone model not found', async () => {
      mockDroneModelsService.findById.mockRejectedValue(
        new HttpException('Drone model not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-models/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/drone-models/:id', () => {
    it('should update a drone model successfully', async () => {
      const updateDroneModelDto = {
        maxSpeed: 80,
      };
      const mockDroneModel = new DroneModelResponseDto({
        id: 1,
        brandId: 1,
        categoryId: 1,
        name: 'DJI Mavic 3',
        maxSpeed: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneModelsService.update.mockResolvedValue(mockDroneModel);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-models/1')
        .send(updateDroneModelDto)
        .expect(200);

      expect(response.body.maxSpeed).toBe(80);
      expect(mockDroneModelsService.update).toHaveBeenCalledWith(1, updateDroneModelDto);
    });

    it('should return 404 when drone model not found', async () => {
      mockDroneModelsService.update.mockRejectedValue(
        new HttpException('Drone model not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-models/999')
        .send({ maxSpeed: 80 })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });

    it('should return 409 when new name already exists', async () => {
      mockDroneModelsService.update.mockRejectedValue(
        new HttpException('Model with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-models/1')
        .send({ name: 'Test Model' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('DELETE /api/v1/drone-models/:id', () => {
    it('should delete a drone model successfully', async () => {
      mockDroneModelsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/drone-models/1')
        .expect(200);

      expect(mockDroneModelsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone model not found', async () => {
      mockDroneModelsService.delete.mockRejectedValue(
        new HttpException('Drone model not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/drone-models/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

