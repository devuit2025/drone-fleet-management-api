import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DroneCategoriesController } from './drone-categories.controller';
import { DroneCategoriesService } from './drone-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DroneCategoryResponseDto } from './dto';

describe('DroneCategoriesController', () => {
  let app: INestApplication;
  let droneCategoriesService: DroneCategoriesService;
  let module: TestingModule;

  const mockDroneCategoriesService = {
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
      controllers: [DroneCategoriesController],
      providers: [
        {
          provide: DroneCategoriesService,
          useValue: mockDroneCategoriesService,
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

    droneCategoriesService = module.get<DroneCategoriesService>(DroneCategoriesService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/drone-categories', () => {
    it('should create a new drone category', async () => {
      const createDroneCategoryDto = {
        name: 'Commercial',
        description: 'Commercial drone category',
      };
      const mockDroneCategory = new DroneCategoryResponseDto({
        id: 1,
        ...createDroneCategoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneCategoriesService.create.mockResolvedValue(mockDroneCategory);

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-categories')
        .send(createDroneCategoryDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDroneCategoryDto.name);
      expect(mockDroneCategoriesService.create).toHaveBeenCalledWith(createDroneCategoryDto);
    });

    it('should return 400 when name is too short', async () => {
      const createDroneCategoryDto = {
        name: 'A',
        description: 'Test description',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-categories')
        .send(createDroneCategoryDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('name'))).toBe(true);
    });

    it('should return 400 when name is missing', async () => {
      const createDroneCategoryDto = {
        description: 'Test description',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-categories')
        .send(createDroneCategoryDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('name'))).toBe(true);
    });

    it('should return 409 when category name already exists', async () => {
      mockDroneCategoriesService.create.mockRejectedValue(
        new HttpException('Category with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-categories')
        .send({ name: 'Commercial', description: 'Test' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/drone-categories', () => {
    it('should return an array of drone categories', async () => {
      const mockDroneCategories = [
        new DroneCategoryResponseDto({
          id: 1,
          name: 'Commercial',
          description: 'Commercial drones',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
        new DroneCategoryResponseDto({
          id: 2,
          name: 'Recreational',
          description: 'Recreational drones',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
      ];

      mockDroneCategoriesService.findAll.mockResolvedValue(mockDroneCategories);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(mockDroneCategoriesService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/drone-categories/:id', () => {
    it('should return a drone category by ID', async () => {
      const mockDroneCategory = new DroneCategoryResponseDto({
        id: 1,
        name: 'Commercial',
        description: 'Commercial drones',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneCategoriesService.findById.mockResolvedValue(mockDroneCategory);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-categories/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Commercial');
      expect(mockDroneCategoriesService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone category not found', async () => {
      mockDroneCategoriesService.findById.mockRejectedValue(
        new HttpException('Drone category not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-categories/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/drone-categories/:id', () => {
    it('should update a drone category successfully', async () => {
      const updateDroneCategoryDto = {
        description: 'Updated description',
      };
      const mockDroneCategory = new DroneCategoryResponseDto({
        id: 1,
        name: 'Commercial',
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneCategoriesService.update.mockResolvedValue(mockDroneCategory);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-categories/1')
        .send(updateDroneCategoryDto)
        .expect(200);

      expect(response.body.description).toBe('Updated description');
      expect(mockDroneCategoriesService.update).toHaveBeenCalledWith(1, updateDroneCategoryDto);
    });

    it('should return 404 when drone category not found', async () => {
      mockDroneCategoriesService.update.mockRejectedValue(
        new HttpException('Drone category not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-categories/999')
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });

    it('should return 409 when new name already exists', async () => {
      mockDroneCategoriesService.update.mockRejectedValue(
        new HttpException('Category with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-categories/1')
        .send({ name: 'Recreational' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('DELETE /api/v1/drone-categories/:id', () => {
    it('should delete a drone category successfully', async () => {
      mockDroneCategoriesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/drone-categories/1')
        .expect(200);

      expect(mockDroneCategoriesService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone category not found', async () => {
      mockDroneCategoriesService.delete.mockRejectedValue(
        new HttpException('Drone category not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/drone-categories/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

