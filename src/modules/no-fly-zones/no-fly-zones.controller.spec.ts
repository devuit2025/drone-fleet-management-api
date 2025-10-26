import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { NoFlyZonesController } from './no-fly-zones.controller';
import { NoFlyZonesService } from './no-fly-zones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoFlyZone, ZoneType } from '../../entities/no-fly-zone.entity';
import { NoFlyZoneResponseDto } from './dto';

describe('NoFlyZonesController', () => {
  let app: INestApplication;
  let noFlyZonesService: NoFlyZonesService;
  let module: TestingModule;

  const mockNoFlyZonesService = {
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
      controllers: [NoFlyZonesController],
      providers: [
        {
          provide: NoFlyZonesService,
          useValue: mockNoFlyZonesService,
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

    noFlyZonesService = module.get<NoFlyZonesService>(NoFlyZonesService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/no-fly-zones', () => {
    it('should create a new no-fly zone successfully', async () => {
      const createNoFlyZoneDto = {
        name: 'Test Zone',
        zoneType: ZoneType.POLYGON,
        geometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
        description: 'Test zone description',
      };

      const mockNoFlyZone = new NoFlyZoneResponseDto({
        id: 1,
        ...createNoFlyZoneDto,
      } as NoFlyZone);

      mockNoFlyZonesService.create.mockResolvedValue(mockNoFlyZone);

      const response = await request(app.getHttpServer())
        .post('/api/v1/no-fly-zones')
        .send(createNoFlyZoneDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Zone');
      expect(mockNoFlyZonesService.create).toHaveBeenCalledWith(createNoFlyZoneDto);
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        name: 'Test Zone',
      } as any;

      const response = await request(app.getHttpServer())
        .post('/api/v1/no-fly-zones')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
    });
  });

  describe('GET /api/v1/no-fly-zones', () => {
    it('should return an array of no-fly zones', async () => {
      const mockNoFlyZones = [
        new NoFlyZoneResponseDto({
          id: 1,
          name: 'Zone 1',
          zoneType: ZoneType.POLYGON,
          geometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
          description: 'Test zone 1',
        } as NoFlyZone),
      ];

      mockNoFlyZonesService.findAll.mockResolvedValue(mockNoFlyZones);

      const response = await request(app.getHttpServer())
        .get('/api/v1/no-fly-zones')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(mockNoFlyZonesService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/no-fly-zones/:id', () => {
    it('should return a no-fly zone by ID', async () => {
      const mockNoFlyZone = new NoFlyZoneResponseDto({
        id: 1,
        name: 'Zone 1',
        zoneType: ZoneType.POLYGON,
        geometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
        description: 'Test zone 1',
      } as NoFlyZone);

      mockNoFlyZonesService.findById.mockResolvedValue(mockNoFlyZone);

      const response = await request(app.getHttpServer())
        .get('/api/v1/no-fly-zones/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(mockNoFlyZonesService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when no-fly zone not found', async () => {
      mockNoFlyZonesService.findById.mockRejectedValue(
        new HttpException('No-fly zone not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/no-fly-zones/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/no-fly-zones/:id', () => {
    it('should update a no-fly zone successfully', async () => {
      const updateNoFlyZoneDto = {
        description: 'Updated description',
      };

      const mockNoFlyZone = new NoFlyZoneResponseDto({
        id: 1,
        name: 'Zone 1',
        zoneType: ZoneType.POLYGON,
        geometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
        description: 'Updated description',
      } as NoFlyZone);

      mockNoFlyZonesService.update.mockResolvedValue(mockNoFlyZone);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/no-fly-zones/1')
        .send(updateNoFlyZoneDto)
        .expect(200);

      expect(response.body.description).toBe('Updated description');
      expect(mockNoFlyZonesService.update).toHaveBeenCalledWith(1, updateNoFlyZoneDto);
    });

    it('should return 404 when no-fly zone not found', async () => {
      mockNoFlyZonesService.update.mockRejectedValue(
        new HttpException('No-fly zone not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/no-fly-zones/999')
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/no-fly-zones/:id', () => {
    it('should delete a no-fly zone successfully', async () => {
      mockNoFlyZonesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/no-fly-zones/1')
        .expect(200);

      expect(mockNoFlyZonesService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when no-fly zone not found', async () => {
      mockNoFlyZonesService.delete.mockRejectedValue(
        new HttpException('No-fly zone not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/no-fly-zones/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

