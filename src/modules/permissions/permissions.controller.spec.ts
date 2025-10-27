import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

describe('PermissionsController', () => {
  let app: INestApplication;
  let permissionsService: PermissionsService;
  let module: TestingModule;

  const mockPermissionsService = {
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
    jest.resetAllMocks();
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
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

    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/permissions', () => {
    const createPermissionDto: CreatePermissionDto = {
      name: 'read.drones',
      description: 'Read drones permission',
    };

    const mockPermission = {
      id: 1,
      name: 'read.drones',
      description: 'Read drones permission',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new permission successfully', async () => {
      mockPermissionsService.create.mockResolvedValue(mockPermission);

      const response = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .send(createPermissionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createPermissionDto.name);
      expect(response.body.description).toBe(createPermissionDto.description);
      expect(mockPermissionsService.create).toHaveBeenCalledWith(createPermissionDto);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        description: 'Only description',
        // missing name
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('name'))).toBe(true);
    });
  });

  describe('GET /api/v1/permissions', () => {
    const mockPermissions = [
      {
        id: 1,
        name: 'read.drones',
        description: 'Read drones permission',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'write.drones',
        description: 'Write drones permission',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all permissions', async () => {
      mockPermissionsService.findAll.mockResolvedValue(mockPermissions);

      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockPermissionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/permissions/:id', () => {
    const mockPermission = {
      id: 1,
      name: 'read.drones',
      description: 'Read drones permission',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return permission by ID', async () => {
      mockPermissionsService.findById.mockResolvedValue(mockPermission);

      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('read.drones');
      expect(mockPermissionsService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionsService.findById.mockRejectedValue(
        new HttpException('Permission not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/permissions/:id', () => {
    const updatePermissionDto: UpdatePermissionDto = {
      name: 'updated.permission',
      description: 'Updated description',
    };

    const mockUpdatedPermission = {
      id: 1,
      name: 'updated.permission',
      description: 'Updated description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update permission successfully', async () => {
      mockPermissionsService.update.mockResolvedValue(mockUpdatedPermission);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/permissions/1')
        .send(updatePermissionDto)
        .expect(200);

      expect(response.body.name).toBe('updated.permission');
      expect(mockPermissionsService.update).toHaveBeenCalledWith(1, updatePermissionDto);
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionsService.update.mockRejectedValue(
        new HttpException('Permission not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/permissions/999')
        .send(updatePermissionDto)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/permissions/:id', () => {
    it('should delete permission successfully', async () => {
      mockPermissionsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/permissions/1')
        .expect(200);

      expect(mockPermissionsService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionsService.delete.mockRejectedValue(
        new HttpException('Permission not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/permissions/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

