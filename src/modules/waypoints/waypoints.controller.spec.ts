import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { WaypointsController } from './waypoints.controller';
import { WaypointsService } from './waypoints.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Waypoint } from '../../entities/waypoint.entity';
import { WaypointResponseDto } from './dto';

describe('WaypointsController', () => {
  let app: INestApplication;
  let waypointsService: WaypointsService;
  let module: TestingModule;

  const mockWaypointsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByMissionId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      controllers: [WaypointsController],
      providers: [
        {
          provide: WaypointsService,
          useValue: mockWaypointsService,
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

    waypointsService = module.get<WaypointsService>(WaypointsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/waypoints', () => {
    it('should create a new waypoint successfully', async () => {
      const createWaypointDto = {
        missionDroneId: 10,
        seqNumber: 1,
        geoPoint: 'POINT(106.6 10.7)',
        altitudeM: 100,
        speedMps: 10,
        action: 'takeoff',
      };

      const waypointEntity = Object.assign(new Waypoint(), {
        id: 1,
        missionDroneId: createWaypointDto.missionDroneId,
        seqNumber: createWaypointDto.seqNumber,
        geoPoint: createWaypointDto.geoPoint,
        altitudeM: createWaypointDto.altitudeM,
        speedMps: createWaypointDto.speedMps,
        action: createWaypointDto.action,
        createdAt: new Date(),
      });

      const mockWaypoint = new WaypointResponseDto(waypointEntity);

      mockWaypointsService.create.mockResolvedValue(mockWaypoint);

      const response = await request(app.getHttpServer())
        .post('/api/v1/waypoints')
        .send(createWaypointDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.missionDroneId).toBe(10);
      expect(mockWaypointsService.create).toHaveBeenCalledWith(createWaypointDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        missionDroneId: 10,
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/waypoints')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/v1/waypoints', () => {
    it('should return an array of waypoints', async () => {
      const mockWaypoints = [
        new WaypointResponseDto(
          Object.assign(new Waypoint(), {
            id: 1,
            missionDroneId: 10,
            seqNumber: 1,
            geoPoint: 'POINT(106.6 10.7)',
            altitudeM: 100,
            speedMps: 10,
            action: 'takeoff',
            createdAt: new Date(),
          }),
        ),
      ];

      mockWaypointsService.findAll.mockResolvedValue(mockWaypoints);

      const response = await request(app.getHttpServer())
        .get('/api/v1/waypoints')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(mockWaypointsService.findAll).toHaveBeenCalled();
    });

    it('should filter by missionId when provided', async () => {
      const mockWaypoints = [
        new WaypointResponseDto(
          Object.assign(new Waypoint(), {
            id: 1,
            missionDroneId: 10,
            seqNumber: 1,
            geoPoint: 'POINT(106.6 10.7)',
            altitudeM: 100,
            speedMps: 10,
            action: 'takeoff',
            createdAt: new Date(),
          }),
        ),
      ];

      mockWaypointsService.findByMissionId.mockResolvedValue(mockWaypoints);

      const response = await request(app.getHttpServer())
        .get('/api/v1/waypoints?missionId=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(mockWaypointsService.findByMissionId).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /api/v1/waypoints/:id', () => {
    it('should return a waypoint by ID', async () => {
      const mockWaypoint = new WaypointResponseDto(
        Object.assign(new Waypoint(), {
          id: 1,
          missionDroneId: 10,
          seqNumber: 1,
          geoPoint: 'POINT(106.6 10.7)',
          altitudeM: 100,
          speedMps: 10,
          action: 'takeoff',
          createdAt: new Date(),
        }),
      );

      mockWaypointsService.findById.mockResolvedValue(mockWaypoint);

      const response = await request(app.getHttpServer())
        .get('/api/v1/waypoints/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockWaypointsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when waypoint not found', async () => {
      mockWaypointsService.findById.mockRejectedValue(
        new HttpException('Waypoint not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/waypoints/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/waypoints/:id', () => {
    it('should update a waypoint successfully', async () => {
      const updateWaypointDto = {
        altitudeM: 150,
        speedMps: 15,
      };

      const mockWaypoint = new WaypointResponseDto(
        Object.assign(new Waypoint(), {
          id: 1,
          missionDroneId: 10,
          seqNumber: 1,
          geoPoint: 'POINT(106.6 10.7)',
          altitudeM: 150,
          speedMps: 15,
          action: 'takeoff',
          createdAt: new Date(),
        }),
      );

      mockWaypointsService.update.mockResolvedValue(mockWaypoint);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/waypoints/1')
        .send(updateWaypointDto)
        .expect(200);

      expect(response.body.altitudeM).toBe(150);
      expect(mockWaypointsService.update).toHaveBeenCalledWith(1, updateWaypointDto);
    });

    it('should return 404 when waypoint not found', async () => {
      mockWaypointsService.update.mockRejectedValue(
        new HttpException('Waypoint not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/waypoints/999')
        .send({ altitudeM: 150 })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/waypoints/:id', () => {
    it('should delete a waypoint successfully', async () => {
      mockWaypointsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/waypoints/1')
        .expect(200);

      expect(mockWaypointsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when waypoint not found', async () => {
      mockWaypointsService.delete.mockRejectedValue(
        new HttpException('Waypoint not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/waypoints/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

