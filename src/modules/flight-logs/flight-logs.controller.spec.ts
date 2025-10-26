import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { FlightLogsController } from './flight-logs.controller';
import { FlightLogsService } from './flight-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FlightLog } from '../../entities/flight-log.entity';
import { FlightLogResponseDto } from './dto';

describe('FlightLogsController', () => {
  let app: INestApplication;
  let flightLogsService: FlightLogsService;
  let module: TestingModule;

  const mockFlightLogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByMission: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      controllers: [FlightLogsController],
      providers: [
        {
          provide: FlightLogsService,
          useValue: mockFlightLogsService,
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

    flightLogsService = module.get<FlightLogsService>(FlightLogsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/flight-logs', () => {
    it('should create a new flight log successfully', async () => {
      const createFlightLogDto = {
        missionId: 1,
        eventType: 'altitude_violation',
        description: 'Altitude exceeded limit',
        timestamp: '2024-01-01T10:00:00Z',
      };

      const mockFlightLog = new FlightLogResponseDto({
        id: 1,
        ...createFlightLogDto,
        timestamp: new Date(createFlightLogDto.timestamp),
      } as FlightLog);

      mockFlightLogsService.create.mockResolvedValue(mockFlightLog);

      const response = await request(app.getHttpServer())
        .post('/api/v1/flight-logs')
        .send(createFlightLogDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.eventType).toBe('altitude_violation');
      expect(mockFlightLogsService.create).toHaveBeenCalledWith(createFlightLogDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        missionId: 1,
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/flight-logs')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/v1/flight-logs', () => {
    it('should return all flight logs', async () => {
      const mockFlightLogs = [
        new FlightLogResponseDto({
          id: 1,
          missionId: 1,
          eventType: 'altitude_violation',
          description: 'Altitude exceeded limit',
          timestamp: new Date(),
        } as FlightLog),
      ];

      mockFlightLogsService.findAll.mockResolvedValue(mockFlightLogs);

      const response = await request(app.getHttpServer())
        .get('/api/v1/flight-logs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockFlightLogsService.findAll).toHaveBeenCalled();
    });

    it('should filter by missionId when provided', async () => {
      const mockFlightLogs = [
        new FlightLogResponseDto({
          id: 1,
          missionId: 1,
          eventType: 'altitude_violation',
          description: 'Altitude exceeded limit',
          timestamp: new Date(),
        } as FlightLog),
      ];

      mockFlightLogsService.findByMission.mockResolvedValue(mockFlightLogs);

      const response = await request(app.getHttpServer())
        .get('/api/v1/flight-logs?missionId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockFlightLogsService.findByMission).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/flight-logs/:id', () => {
    it('should return a flight log by ID', async () => {
      const mockFlightLog = new FlightLogResponseDto({
        id: 1,
        missionId: 1,
        eventType: 'altitude_violation',
        description: 'Altitude exceeded limit',
        timestamp: new Date(),
      } as FlightLog);

      mockFlightLogsService.findById.mockResolvedValue(mockFlightLog);

      const response = await request(app.getHttpServer())
        .get('/api/v1/flight-logs/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockFlightLogsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when flight log not found', async () => {
      mockFlightLogsService.findById.mockRejectedValue(
        new HttpException('Flight log not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/flight-logs/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/flight-logs/:id', () => {
    it('should delete a flight log successfully', async () => {
      mockFlightLogsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/flight-logs/1')
        .expect(200);

      expect(mockFlightLogsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when flight log not found', async () => {
      mockFlightLogsService.delete.mockRejectedValue(
        new HttpException('Flight log not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/flight-logs/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

