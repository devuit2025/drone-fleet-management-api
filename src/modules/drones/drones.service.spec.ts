import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DronesService } from './drones.service';
import { DroneRepository } from '../../repositories/drone.repository';
import { DroneStatus } from '../../entities/drone.entity';

describe('DronesService', () => {
  let service: DronesService;
  let droneRepository: DroneRepository;

  const mockDroneRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySerialNumber: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByStatus: jest.fn(),
    findActiveDrones: jest.fn(),
    findAvailableDrones: jest.fn(),
    updateStatus: jest.fn(),
    updateBatteryCapacity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DronesService,
        {
          provide: DroneRepository,
          useValue: mockDroneRepository,
        },
      ],
    }).compile();

    service = module.get<DronesService>(DronesService);
    droneRepository = module.get<DroneRepository>(DroneRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDroneDto = {
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
    };

    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create a new drone successfully', async () => {
      mockDroneRepository.findBySerialNumber.mockResolvedValue(null);
      mockDroneRepository.create.mockResolvedValue(mockDrone);

      const result = await service.create(createDroneDto);

      expect(result).toEqual(mockDrone);
      expect(mockDroneRepository.findBySerialNumber).toHaveBeenCalledWith(createDroneDto.serial_number);
      expect(mockDroneRepository.create).toHaveBeenCalledWith(createDroneDto);
    });

    it('should throw ConflictException when drone already exists', async () => {
      mockDroneRepository.findBySerialNumber.mockResolvedValue(mockDrone);

      await expect(service.create(createDroneDto)).rejects.toThrow(ConflictException);
      expect(mockDroneRepository.findBySerialNumber).toHaveBeenCalledWith(createDroneDto.serial_number);
    });
  });

  describe('findAll', () => {
    const mockDrones = [
      {
        id: 1,
        name: 'Drone 1',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.AVAILABLE,
        max_payload: 1000,
        battery_capacity: 100,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Drone 2',
        model: 'DJI Mavic Pro',
        serial_number: 'DRONE-002',
        status: DroneStatus.IN_MISSION,
        max_payload: 500,
        battery_capacity: 85,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return all drones', async () => {
      mockDroneRepository.findAll.mockResolvedValue(mockDrones);

      const result = await service.findAll();

      expect(result).toEqual(mockDrones);
      expect(mockDroneRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return drone by ID', async () => {
      mockDroneRepository.findById.mockResolvedValue(mockDrone);

      const result = await service.findById(1);

      expect(result).toEqual(mockDrone);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findBySerialNumber', () => {
    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return drone by serial number', async () => {
      mockDroneRepository.findBySerialNumber.mockResolvedValue(mockDrone);

      const result = await service.findBySerialNumber('DRONE-001');

      expect(result).toEqual(mockDrone);
      expect(mockDroneRepository.findBySerialNumber).toHaveBeenCalledWith('DRONE-001');
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findBySerialNumber.mockResolvedValue(null);

      await expect(service.findBySerialNumber('DRONE-999')).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findBySerialNumber).toHaveBeenCalledWith('DRONE-999');
    });
  });

  describe('update', () => {
    const updateDroneDto = {
      name: 'Updated Drone',
      battery_capacity: 90,
    };

    const existingDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedDrone = {
      id: 1,
      name: 'Updated Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 90,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update drone successfully', async () => {
      mockDroneRepository.findById.mockResolvedValue(existingDrone);
      mockDroneRepository.update.mockResolvedValue(updatedDrone);

      const result = await service.update(1, updateDroneDto);

      expect(result).toEqual(updatedDrone);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.update).toHaveBeenCalledWith(1, updateDroneDto);
    });

    it('should throw ConflictException when serial number already exists', async () => {
      const updateWithSerialDto = {
        serial_number: 'DRONE-002',
      };

      mockDroneRepository.findById.mockResolvedValue(existingDrone);
      mockDroneRepository.findBySerialNumber.mockResolvedValue({
        id: 2,
        serial_number: 'DRONE-002',
      });

      await expect(service.update(1, updateWithSerialDto)).rejects.toThrow(ConflictException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.findBySerialNumber).toHaveBeenCalledWith(updateWithSerialDto.serial_number);
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDroneDto)).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('delete', () => {
    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should delete drone successfully', async () => {
      mockDroneRepository.findById.mockResolvedValue(mockDrone);
      mockDroneRepository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByStatus', () => {
    const mockDrones = [
      {
        id: 1,
        name: 'Available Drone',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.AVAILABLE,
        max_payload: 1000,
        battery_capacity: 100,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return drones by status', async () => {
      mockDroneRepository.findByStatus.mockResolvedValue(mockDrones);

      const result = await service.findByStatus(DroneStatus.AVAILABLE);

      expect(result).toEqual(mockDrones);
      expect(mockDroneRepository.findByStatus).toHaveBeenCalledWith(DroneStatus.AVAILABLE);
    });
  });

  describe('findAvailableDrones', () => {
    const mockAvailableDrones = [
      {
        id: 1,
        name: 'Available Drone',
        model: 'DJI Phantom 4',
        serial_number: 'DRONE-001',
        status: DroneStatus.AVAILABLE,
        max_payload: 1000,
        battery_capacity: 100,
        last_maintenance: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return available drones', async () => {
      mockDroneRepository.findAvailableDrones.mockResolvedValue(mockAvailableDrones);

      const result = await service.findAvailableDrones();

      expect(result).toEqual(mockAvailableDrones);
      expect(mockDroneRepository.findAvailableDrones).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    const updateStatusDto = {
      status: DroneStatus.IN_MISSION,
      battery_capacity: 85,
    };

    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update drone status successfully', async () => {
      mockDroneRepository.findById.mockResolvedValue(mockDrone);
      mockDroneRepository.updateStatus.mockResolvedValue(undefined);
      mockDroneRepository.updateBatteryCapacity.mockResolvedValue(undefined);

      await service.updateStatus(1, updateStatusDto);

      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.updateStatus).toHaveBeenCalledWith(1, updateStatusDto.status);
      expect(mockDroneRepository.updateBatteryCapacity).toHaveBeenCalledWith(1, updateStatusDto.battery_capacity);
    });

    it('should update status without battery capacity', async () => {
      const updateStatusDtoWithoutBattery = {
        status: DroneStatus.IN_MISSION,
      };

      mockDroneRepository.findById.mockResolvedValue(mockDrone);
      mockDroneRepository.updateStatus.mockResolvedValue(undefined);

      await service.updateStatus(1, updateStatusDtoWithoutBattery);

      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.updateStatus).toHaveBeenCalledWith(1, updateStatusDtoWithoutBattery.status);
      expect(mockDroneRepository.updateBatteryCapacity).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findById.mockResolvedValue(null);

      await expect(service.updateStatus(999, updateStatusDto)).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('updateBatteryCapacity', () => {
    const mockDrone = {
      id: 1,
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serial_number: 'DRONE-001',
      status: DroneStatus.AVAILABLE,
      max_payload: 1000,
      battery_capacity: 100,
      last_maintenance: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update battery capacity successfully', async () => {
      mockDroneRepository.findById.mockResolvedValue(mockDrone);
      mockDroneRepository.updateBatteryCapacity.mockResolvedValue(undefined);

      await service.updateBatteryCapacity(1, 85);

      expect(mockDroneRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDroneRepository.updateBatteryCapacity).toHaveBeenCalledWith(1, 85);
    });

    it('should throw NotFoundException when drone not found', async () => {
      mockDroneRepository.findById.mockResolvedValue(null);

      await expect(service.updateBatteryCapacity(999, 85)).rejects.toThrow(NotFoundException);
      expect(mockDroneRepository.findById).toHaveBeenCalledWith(999);
    });
  });
});
