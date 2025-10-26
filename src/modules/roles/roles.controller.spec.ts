import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoleDto, UpdateRoleDto } from './dto';

describe('RolesController', () => {
  let app: INestApplication;
  let rolesService: RolesService;
  let module: TestingModule;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignPermissions: jest.fn(),
    removePermissions: jest.fn(),
    setPermissions: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
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

    rolesService = module.get<RolesService>(RolesService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/roles', () => {
    const createRoleDto: CreateRoleDto = {
      name: 'Test Role',
      description: 'Test Description',
      permissionIds: [1, 2],
    };

    const mockRole = {
      id: 1,
      name: 'Test Role',
      description: 'Test Description',
      permissions: [{ id: 1, name: 'Permission 1' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new role successfully', async () => {
      mockRolesService.create.mockResolvedValue(mockRole);

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .send(createRoleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createRoleDto.name);
      expect(response.body.description).toBe(createRoleDto.description);
      expect(mockRolesService.create).toHaveBeenCalledWith(createRoleDto);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        description: 'Only description',
        // missing name
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .send(invalidDto)
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('name'))).toBe(true);
    });
  });

  describe('GET /api/v1/roles', () => {
    const mockRoles = [
      {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'User',
        description: 'Regular user role',
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all roles', async () => {
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const response = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockRolesService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/roles/:id', () => {
    const mockRole = {
      id: 1,
      name: 'Test Role',
      description: 'Test Description',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return role by ID', async () => {
      mockRolesService.findById.mockResolvedValue(mockRole);

      const response = await request(app.getHttpServer())
        .get('/api/v1/roles/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Test Role');
      expect(mockRolesService.findById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.findById.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/roles/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/roles/:id', () => {
    const updateRoleDto: UpdateRoleDto = {
      name: 'Updated Role',
      description: 'Updated Description',
    };

    const mockUpdatedRole = {
      id: 1,
      name: 'Updated Role',
      description: 'Updated Description',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update role successfully', async () => {
      mockRolesService.update.mockResolvedValue(mockUpdatedRole);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/roles/1')
        .send(updateRoleDto)
        .expect(200);

      expect(response.body.name).toBe('Updated Role');
      expect(mockRolesService.update).toHaveBeenCalledWith(1, updateRoleDto);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.update.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/roles/999')
        .send(updateRoleDto)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/roles/:id', () => {
    it('should delete role successfully', async () => {
      mockRolesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/roles/1')
        .expect(200);

      expect(mockRolesService.delete).toHaveBeenCalledWith(1);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.delete.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/roles/999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/roles/:id/permissions', () => {
    const mockRole = {
      id: 1,
      name: 'Test Role',
      description: 'Test Description',
      permissions: [{ id: 1, name: 'Permission 1' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should assign permissions to role successfully', async () => {
      const body = { permissionIds: [1, 2] };
      mockRolesService.assignPermissions.mockResolvedValue({
        ...mockRole,
        permissions: [{ id: 1 }, { id: 2 }],
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles/1/permissions')
        .send(body)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(mockRolesService.assignPermissions).toHaveBeenCalledWith(1, body.permissionIds);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.assignPermissions.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles/999/permissions')
        .send({ permissionIds: [1] })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/roles/:id/permissions', () => {
    const mockRole = {
      id: 1,
      name: 'Test Role',
      description: 'Test Description',
      permissions: [{ id: 2 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should remove permissions from role successfully', async () => {
      const body = { permissionIds: [1] };
      mockRolesService.removePermissions.mockResolvedValue(mockRole);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/roles/1/permissions')
        .send(body)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(mockRolesService.removePermissions).toHaveBeenCalledWith(1, body.permissionIds);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.removePermissions.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .delete('/api/v1/roles/999/permissions')
        .send({ permissionIds: [1] })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/roles/:id/permissions', () => {
    const mockRole = {
      id: 1,
      name: 'Test Role',
      description: 'Test Description',
      permissions: [{ id: 1 }, { id: 2 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set permissions for role successfully', async () => {
      const body = { permissionIds: [1, 2, 3] };
      mockRolesService.setPermissions.mockResolvedValue(mockRole);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/roles/1/permissions')
        .send(body)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(mockRolesService.setPermissions).toHaveBeenCalledWith(1, body.permissionIds);
    });

    it('should set empty permissions array when permissionIds is empty', async () => {
      const body = { permissionIds: [] };
      mockRolesService.setPermissions.mockResolvedValue({
        ...mockRole,
        permissions: [],
      });

      const response = await request(app.getHttpServer())
        .patch('/api/v1/roles/1/permissions')
        .send(body)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(mockRolesService.setPermissions).toHaveBeenCalledWith(1, []);
    });

    it('should return 404 when role not found', async () => {
      mockRolesService.setPermissions.mockRejectedValue(
        new HttpException('Role not found', HttpStatus.NOT_FOUND),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/v1/roles/999/permissions')
        .send({ permissionIds: [1] })
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});

