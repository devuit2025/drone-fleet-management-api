import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Telemetry } from '../../entities/telemetry.entity';
import { TelemetryResponseDto } from './dto';

describe('TelemetryController', () => {
  let app: INestApplication;
  let telemetryService: TelemetryService;
  let module: TestingModule;

  const mockTelemetryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDrone: jest.fn(),
    findByMission: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [
        {
          provide: TelemetryService,
          useValue: mockTelemetryService,
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

    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/telemetry', () => {
    it('should create a new telemetry record successfully', async () => {
      const createTelemetryDto = {
        droneId: 1,
        missionId: 1,
        timestamp: '2024-01-01T10:00:00Z',
        location: 'POINT(106.6 10.7)',
        altitudeM: 100,
        speedMps: 10,
        batteryPct: 90,
        status: 'normal',
        payloadWeight: 500,
      };

      const mockTelemetry = new TelemetryResponseDto({
        id: 1,
        ...createTelemetryDto,
        timestamp: new Date(createTelemetryDto.timestamp),
      } as Telemetry);

      mockTelemetryService.create.mockResolvedValue(mockTelemetry);

      const response = await request(app.getHttpServer())
        .post('/api/v1/telemetry')
        .send(createTelemetryDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.droneId).toBe(1);
      expect(mockTelemetryService.create).toHaveBeenCalledWith(createTelemetryDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        droneId: 1,
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/telemetry')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/v1/telemetry', () => {
    it('should return all telemetry records', async () => {
      const mockTelemetry = [
        new TelemetryResponseDto({
          id: 1,
          droneId: 1,
          missionId: 1,
          timestamp: new Date(),
          location: 'POINT(106.6 10.7)',
          altitudeM: 100,
          speedMps: 10,
          batteryPct: 90,
          status: 'normal',
          payloadWeight: 500,
        } as Telemetry),
      ];

      mockTelemetryService.findAll.mockResolvedValue(mockTelemetry);

      const response = await request(app.getHttpServer())
        .get('/api/v1/telemetry')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockTelemetryService.findAll).toHaveBeenCalled();
    });

    it('should filter by droneId when provided', async () => {
      const mockTelemetry = [
        new TelemetryResponseDto({
          id: 1,
          droneId: 1,
          missionId: 1,
          timestamp: new Date(),
          location: 'POINT(106.6 10.7)',
          altitudeM: 100,
          speedMps: 10,
          batteryPct: 90,
          status: 'normal',
          payloadWeight: 500,
        } as Telemetry),
      ];

      mockTelemetryService.findByDrone.mockResolvedValue(mockTelemetry);

      const response = await request(app.getHttpServer())
        .get('/api/v1/telemetry?droneId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockTelemetryService.findByDrone).toHaveBeenCalledWith(1);
    });

    it('should filter by missionId when provided', async () => {
      const mockTelemetry = [
        new TelemetryResponseDto({
          id: 1,
          droneId: 1,
          missionId: 1,
          timestamp: new Date(),
          location: 'POINT(106.6 10.7)',
          altitudeM: 100,
          speedMps: 10,
          batteryPct: 90,
          status: 'normal',
          payloadWeight: 500,
        } as Telemetry),
      ];

      mockTelemetryService.findByMission.mockResolvedValue(mockTelemetry);

      const response = await request(app.getHttpServer())
        .get('/api/v1/telemetry?missionId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockTelemetryService.findByMission).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/telemetry/:id', () => {
    it('should return a telemetry record by ID', async () => {
      const mockTelemetry = new TelemetryResponseDto({
        id: 1,
        droneId: 1,
        missionId: 1,
        timestamp: new Date(),
        location: 'POINT(106.6 10.7)',
        altitudeM: 100,
        speedMps: 10,
        batteryPct: 90,
        status: 'normal',
        payloadWeight: 500,
      } as Telemetry);

      mockTelemetryService.findById.mockResolvedValue(mockTelemetry);

      const response = await request(app.getHttpServer())
        .get('/api/v1/telemetry/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockTelemetryService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when telemetry record not found', async () => {
      mockTelemetryService.findById.mockRejectedValue(
        new HttpException('Telemetry not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/telemetry/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/telemetry/:id', () => {
    it('should delete a telemetry record successfully', async () => {
      mockTelemetryService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/telemetry/1')
        .expect(200);

      expect(mockTelemetryService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when telemetry record not found', async () => {
      mockTelemetryService.delete.mockRejectedValue(
        new HttpException('Telemetry not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/telemetry/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

