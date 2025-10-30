import { Test, TestingModule } from '@nestjs/testing';
import { PilotsController } from './pilots.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pilot, PilotStatus } from '../../entities/pilot.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePilotDto, PilotResponseDto } from './dto';

describe('PilotsController', () => {
  let controller: PilotsController;
  let repository: Repository<Pilot>;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PilotsController],
      providers: [
        {
          provide: getRepositoryToken(Pilot),
          useValue: mockRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PilotsController>(PilotsController);
    repository = module.get<Repository<Pilot>>(getRepositoryToken(Pilot));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of pilots', async () => {
      const mockPilots = [
        {
          id: 1,
          userId: 1,
          name: 'John Doe',
          status: PilotStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          name: 'Jane Smith',
          status: PilotStatus.INACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockPilots);

      const result = await controller.findAll({ page: 1, per: 10 });

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PilotResponseDto);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new pilot', async () => {
      const createPilotDto: CreatePilotDto = {
        userId: 1,
        name: 'John Doe',
        status: PilotStatus.ACTIVE,
      };

      const savedPilot = {
        id: 1,
        userId: 1,
        name: 'John Doe',
        status: PilotStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue({ ...savedPilot });
      mockRepository.save.mockResolvedValue(savedPilot);

      const result = await controller.create(createPilotDto);

      expect(result).toBeInstanceOf(PilotResponseDto);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: createPilotDto.userId,
        name: createPilotDto.name,
        status: createPilotDto.status,
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should use default status when not provided', async () => {
      const createPilotDto: CreatePilotDto = {
        userId: 1,
        name: 'John Doe',
      };

      const savedPilot = {
        id: 1,
        userId: 1,
        name: 'John Doe',
        status: PilotStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue({ ...savedPilot });
      mockRepository.save.mockResolvedValue(savedPilot);

      const result = await controller.create(createPilotDto);

      expect(result).toBeInstanceOf(PilotResponseDto);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: createPilotDto.userId,
        name: createPilotDto.name,
        status: PilotStatus.ACTIVE,
      });
    });
  });
});

