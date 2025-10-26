import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DroneBrandsController } from './drone-brands.controller';
import { DroneBrandsService } from './drone-brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DroneBrandResponseDto } from './dto';

describe('DroneBrandsController', () => {
  let app: INestApplication;
  let droneBrandsService: DroneBrandsService;
  let module: TestingModule;

  const mockDroneBrandsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
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
      controllers: [DroneBrandsController],
      providers: [
        {
          provide: DroneBrandsService,
          useValue: mockDroneBrandsService,
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

    droneBrandsService = module.get<DroneBrandsService>(DroneBrandsService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/v1/drone-brands', () => {
    it('should create a new drone brand', async () => {
      const createDroneBrandDto = {
        name: 'DJI',
        country: 'China',
        website: 'https://www.dji.com',
      };
      const mockDroneBrand = new DroneBrandResponseDto({
        id: 1,
        ...createDroneBrandDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneBrandsService.create.mockResolvedValue(mockDroneBrand);

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-brands')
        .send(createDroneBrandDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDroneBrandDto.name);
      expect(mockDroneBrandsService.create).toHaveBeenCalledWith(createDroneBrandDto);
    });

    it('should return 400 when name is too short', async () => {
      const createDroneBrandDto = {
        name: 'A',
        country: 'China',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-brands')
        .send(createDroneBrandDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('name'))).toBe(true);
    });

    it('should return 400 when name is missing', async () => {
      const createDroneBrandDto = {
        country: 'China',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-brands')
        .send(createDroneBrandDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some((msg) => msg.includes('name'))).toBe(true);
    });

    it('should return 409 when brand name already exists', async () => {
      mockDroneBrandsService.create.mockRejectedValue(
        new HttpException('Brand with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/drone-brands')
        .send({ name: 'DJI', country: 'China' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/drone-brands', () => {
    it('should return an array of drone brands', async () => {
      const mockDroneBrands = [
        new DroneBrandResponseDto({
          id: 1,
          name: 'DJI',
          country: 'China',
          website: 'https://www.dji.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
        new DroneBrandResponseDto({
          id: 2,
          name: 'Autel',
          country: 'USA',
          website: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any),
      ];

      mockDroneBrandsService.findAll.mockResolvedValue(mockDroneBrands);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-brands')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(mockDroneBrandsService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/drone-brands/:id', () => {
    it('should return a drone brand by ID', async () => {
      const mockDroneBrand = new DroneBrandResponseDto({
        id: 1,
        name: 'DJI',
        country: 'China',
        website: 'https://www.dji.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneBrandsService.findById.mockResolvedValue(mockDroneBrand);

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-brands/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('DJI');
      expect(mockDroneBrandsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone brand not found', async () => {
      mockDroneBrandsService.findById.mockRejectedValue(
        new HttpException('Drone brand not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/drone-brands/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/drone-brands/:id', () => {
    it('should update a drone brand successfully', async () => {
      const updateDroneBrandDto = {
        country: 'Taiwan',
      };
      const mockDroneBrand = new DroneBrandResponseDto({
        id: 1,
        name: 'DJI',
        country: 'Taiwan',
        website: 'https://www.dji.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockDroneBrandsService.update.mockResolvedValue(mockDroneBrand);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-brands/1')
        .send(updateDroneBrandDto)
        .expect(200);

      expect(response.body.country).toBe('Taiwan');
      expect(mockDroneBrandsService.update).toHaveBeenCalledWith(1, updateDroneBrandDto);
    });

    it('should return 404 when drone brand not found', async () => {
      mockDroneBrandsService.update.mockRejectedValue(
        new HttpException('Drone brand not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-brands/999')
        .send({ country: 'Taiwan' })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });

    it('should return 409 when new name already exists', async () => {
      mockDroneBrandsService.update.mockRejectedValue(
        new HttpException('Brand with this name already exists', HttpStatus.CONFLICT),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/drone-brands/1')
        .send({ name: 'Autel' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('DELETE /api/v1/drone-brands/:id', () => {
    it('should delete a drone brand successfully', async () => {
      mockDroneBrandsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/drone-brands/1')
        .expect(200);

      expect(mockDroneBrandsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when drone brand not found', async () => {
      mockDroneBrandsService.delete.mockRejectedValue(
        new HttpException('Drone brand not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/drone-brands/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

