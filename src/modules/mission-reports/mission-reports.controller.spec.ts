import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MissionReportsController } from './mission-reports.controller';
import { MissionReportsService } from './mission-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionReport } from '../../entities/mission-report.entity';
import { MissionReportResponseDto } from './dto';

describe('MissionReportsController', () => {
  let app: INestApplication;
  let missionReportsService: MissionReportsService;
  let module: TestingModule;

  const mockMissionReportsService = {
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
      controllers: [MissionReportsController],
      providers: [
        {
          provide: MissionReportsService,
          useValue: mockMissionReportsService,
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

    missionReportsService = module.get<MissionReportsService>(MissionReportsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/mission-reports', () => {
    it('should create a new mission report successfully', async () => {
      const createMissionReportDto = {
        missionId: 1,
        flightTimeSec: 3600,
        distanceM: 10000,
        avgSpeedMps: 15.5,
        batteryConsumedPct: 45.2,
        incidentCount: 0,
      };

      const mockMissionReport = new MissionReportResponseDto({
        id: 1,
        ...createMissionReportDto,
        createdAt: new Date(),
      } as MissionReport);

      mockMissionReportsService.create.mockResolvedValue(mockMissionReport);

      const response = await request(app.getHttpServer())
        .post('/api/v1/mission-reports')
        .send(createMissionReportDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.flightTimeSec).toBe(3600);
      expect(mockMissionReportsService.create).toHaveBeenCalledWith(createMissionReportDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        missionId: 1,
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/mission-reports')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/v1/mission-reports', () => {
    it('should return all mission reports', async () => {
      const mockMissionReports = [
        new MissionReportResponseDto({
          id: 1,
          missionId: 1,
          flightTimeSec: 3600,
          distanceM: 10000,
          avgSpeedMps: 15.5,
          batteryConsumedPct: 45.2,
          incidentCount: 0,
          createdAt: new Date(),
        } as MissionReport),
      ];

      mockMissionReportsService.findAll.mockResolvedValue(mockMissionReports);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-reports')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockMissionReportsService.findAll).toHaveBeenCalled();
    });

    it('should filter by missionId when provided', async () => {
      const mockMissionReports = [
        new MissionReportResponseDto({
          id: 1,
          missionId: 1,
          flightTimeSec: 3600,
          distanceM: 10000,
          avgSpeedMps: 15.5,
          batteryConsumedPct: 45.2,
          incidentCount: 0,
          createdAt: new Date(),
        } as MissionReport),
      ];

      mockMissionReportsService.findByMission.mockResolvedValue(mockMissionReports);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-reports?missionId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockMissionReportsService.findByMission).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/mission-reports/:id', () => {
    it('should return a mission report by ID', async () => {
      const mockMissionReport = new MissionReportResponseDto({
        id: 1,
        missionId: 1,
        flightTimeSec: 3600,
        distanceM: 10000,
        avgSpeedMps: 15.5,
        batteryConsumedPct: 45.2,
        incidentCount: 0,
        createdAt: new Date(),
      } as MissionReport);

      mockMissionReportsService.findById.mockResolvedValue(mockMissionReport);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-reports/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockMissionReportsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when mission report not found', async () => {
      mockMissionReportsService.findById.mockRejectedValue(
        new HttpException('Mission report not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-reports/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/mission-reports/:id', () => {
    it('should delete a mission report successfully', async () => {
      mockMissionReportsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/mission-reports/1')
        .expect(200);

      expect(mockMissionReportsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when mission report not found', async () => {
      mockMissionReportsService.delete.mockRejectedValue(
        new HttpException('Mission report not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/mission-reports/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

