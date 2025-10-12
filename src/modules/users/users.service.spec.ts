import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from '../../repositories/user.repository';
import { UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.OPERATOR,
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        role: UserRole.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        role: UserRole.OPERATOR,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return all users', async () => {
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return user by ID', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByEmail', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return user by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('update', () => {
    const updateUserDto = {
      name: 'Updated User',
      email: 'updated@example.com',
    };

    const existingUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedUser = {
      id: 1,
      name: 'Updated User',
      email: 'updated@example.com',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 2,
        email: 'updated@example.com',
      });

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('delete', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.OPERATOR,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should delete user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByRole', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return users by role', async () => {
      mockUserRepository.findByRole.mockResolvedValue(mockUsers);

      const result = await service.findByRole(UserRole.ADMIN);

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findByRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });
  });
});
