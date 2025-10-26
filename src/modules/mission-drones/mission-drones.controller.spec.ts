import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MissionDronesController } from './mission-drones.controller';
import { MissionDronesService } from './mission-drones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MissionDrone } from '../../entities/mission-drone.entity';
import { MissionDroneResponseDto } from './dto';

describe('MissionDronesController', () => {
  let app: INestApplication;
  let missionDronesService: MissionDronesService;
  let module: TestingModule;

  const mockMissionDronesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByMission: jest.fn(),
    findByDrone: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      controllers: [MissionDronesController],
      providers: [
        {
          provide: MissionDronesService,
          useValue: mockMissionDronesService,
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

    missionDronesService = module.get<MissionDronesService>(MissionDronesService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/mission-drones', () => {
    it('should assign a drone to a mission successfully', async () => {
      const createMissionDroneDto = {
        missionId: 1,
        droneId: 1,
      };

      const mockMissionDrone = new MissionDroneResponseDto({
        id: 1,
        ...createMissionDroneDto,
        assignedAt: new Date(),
      } as MissionDrone);

      mockMissionDronesService.create.mockResolvedValue(mockMissionDrone);

      const response = await request(app.getHttpServer())
        .post('/api/v1/mission-drones')
        .send(createMissionDroneDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.missionId).toBe(1);
      expect(mockMissionDronesService.create).toHaveBeenCalledWith(createMissionDroneDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        missionId: 1,
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/mission-drones')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('should return 409 when drone is already assigned', async () => {
      mockMissionDronesService.create.mockRejectedValue(
        new HttpException('Drone is already assigned to this mission', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/mission-drones')
        .send({ missionId: 1, droneId: 1 })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/mission-drones', () => {
    it('should return all mission-drone assignments', async () => {
      const mockMissionDrones = [
        new MissionDroneResponseDto({
          id: 1,
          missionId: 1,
          droneId: 1,
          assignedAt: new Date(),
        } as MissionDrone),
      ];

      mockMissionDronesService.findAll.mockResolvedValue(mockMissionDrones);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-drones')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockMissionDronesService.findAll).toHaveBeenCalled();
    });

    it('should filter by missionId when provided', async () => {
      const mockMissionDrones = [
        new MissionDroneResponseDto({
          id: 1,
          missionId: 1,
          droneId: 1,
          assignedAt: new Date(),
        } as MissionDrone),
      ];

      mockMissionDronesService.findByMission.mockResolvedValue(mockMissionDrones);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-drones?missionId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockMissionDronesService.findByMission).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/mission-drones/:id', () => {
    it('should return a mission-drone assignment by ID', async () => {
      const mockMissionDrone = new MissionDroneResponseDto({
        id: 1,
        missionId: 1,
        droneId: 1,
        assignedAt: new Date(),
      } as MissionDrone);

      mockMissionDronesService.findById.mockResolvedValue(mockMissionDrone);

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-drones/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockMissionDronesService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when mission-drone assignment not found', async () => {
      mockMissionDronesService.findById.mockRejectedValue(
        new HttpException('Mission-Drone assignment not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/mission-drones/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/mission-drones/:id', () => {
    it('should remove a mission-drone assignment successfully', async () => {
      mockMissionDronesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/mission-drones/1')
        .expect(200);

      expect(mockMissionDronesService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when mission-drone assignment not found', async () => {
      mockMissionDronesService.delete.mockRejectedValue(
        new HttpException('Mission-Drone assignment not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/mission-drones/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

