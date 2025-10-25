import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { FlightRepository } from '../../repositories/flight.repository';
import { FlightPathRepository } from '../../repositories/flight-path.repository';
import { MissionStatus } from '../../entities/mission.entity';

describe('MissionsService', () => {
    let service: MissionsService;
    let flightRepository: FlightRepository;
    let flightPathRepository: FlightPathRepository;

    const mockFlightRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByStatus: jest.fn(),
        findByPilot: jest.fn(),
        findByDrone: jest.fn(),
        findActiveFlights: jest.fn(),
        findFlightsByDateRange: jest.fn(),
        startFlight: jest.fn(),
        endFlight: jest.fn(),
    };

    const mockFlightPathRepository = {
        addPathPoint: jest.fn(),
        findByFlightId: jest.fn(),
        getLatestPathPoint: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MissionsService,
                {
                    provide: FlightRepository,
                    useValue: mockFlightRepository,
                },
                {
                    provide: FlightPathRepository,
                    useValue: mockFlightPathRepository,
                },
            ],
        }).compile();

        service = module.get<MissionsService>(MissionsService);
        flightRepository = module.get<FlightRepository>(FlightRepository);
        flightPathRepository = module.get<FlightPathRepository>(FlightPathRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createFlightDto = {
            name: 'Test Flight',
            description: 'Test flight description',
            plannedStartTime: '2024-01-01T08:00:00Z',
            plannedDuration: 60,
            startLatitude: 10.7,
            startLongitude: 106.6,
            startAltitude: 100,
            pilotId: 'pilot-uuid',
            droneId: 'drone-uuid',
            weatherConditions: 'Clear',
            notes: 'Test notes',
        };

        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should create a new flight successfully', async () => {
            mockFlightRepository.create.mockResolvedValue(mockFlight);

            const result = await service.create(createFlightDto);

            expect(result).toEqual(mockFlight);
            expect(mockFlightRepository.create).toHaveBeenCalledWith({
                ...createFlightDto,
                start_time: new Date(createFlightDto.plannedStartTime),
            });
        });
    });

    describe('findAll', () => {
        const mockFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Flight 1',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                pilot_id: 2,
                license_id: 2,
                mission_name: 'Flight 2',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-02T09:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return all flights', async () => {
            mockFlightRepository.findAll.mockResolvedValue(mockFlights);

            const result = await service.findAll();

            expect(result).toEqual(mockFlights);
            expect(mockFlightRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should return flight by ID', async () => {
            mockFlightRepository.findById.mockResolvedValue(mockFlight);

            const result = await service.findById(1);

            expect(result).toEqual(mockFlight);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.findById(999)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('update', () => {
        const updateFlightDto = {
            name: 'Updated Flight',
            plannedDuration: 90,
        };

        const plannedFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const updatedFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Updated Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should update planned flight successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(plannedFlight);
            mockFlightRepository.update.mockResolvedValue(updatedFlight);

            const result = await service.update(1, updateFlightDto);

            expect(result).toEqual(updatedFlight);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightRepository.update).toHaveBeenCalledWith(1, updateFlightDto);
        });

        it('should throw BadRequestException when updating non-planned flight', async () => {
            const inProgressFlight = {
                ...plannedFlight,
                status: MissionStatus.IN_PROGRESS,
            };

            mockFlightRepository.findById.mockResolvedValue(inProgressFlight);

            await expect(service.update(1, updateFlightDto)).rejects.toThrow(BadRequestException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.update(999, updateFlightDto)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('delete', () => {
        const plannedFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should delete planned flight successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(plannedFlight);
            mockFlightRepository.delete.mockResolvedValue(undefined);

            await service.delete(1);

            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should throw BadRequestException when deleting in-progress flight', async () => {
            const inProgressFlight = {
                ...plannedFlight,
                status: MissionStatus.IN_PROGRESS,
            };

            mockFlightRepository.findById.mockResolvedValue(inProgressFlight);

            await expect(service.delete(1)).rejects.toThrow(BadRequestException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('findByStatus', () => {
        const mockFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Planned Flight',
                status: MissionStatus.PLANNED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by status', async () => {
            mockFlightRepository.findByStatus.mockResolvedValue(mockFlights);

            const result = await service.findByStatus(MissionStatus.PLANNED);

            expect(result).toEqual(mockFlights);
            expect(mockFlightRepository.findByStatus).toHaveBeenCalledWith(MissionStatus.PLANNED);
        });
    });

    describe('findByPilot', () => {
        const mockPilotFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Pilot Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by pilot', async () => {
            mockFlightRepository.findByPilot.mockResolvedValue(mockPilotFlights);

            const result = await service.findByPilot(1);

            expect(result).toEqual(mockPilotFlights);
            expect(mockFlightRepository.findByPilot).toHaveBeenCalledWith(1);
        });
    });

    describe('findByDrone', () => {
        const mockDroneFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Drone Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by drone', async () => {
            mockFlightRepository.findByDrone.mockResolvedValue(mockDroneFlights);

            const result = await service.findByDrone(1);

            expect(result).toEqual(mockDroneFlights);
            expect(mockFlightRepository.findByDrone).toHaveBeenCalledWith(1);
        });
    });

    describe('findActiveFlights', () => {
        const mockActiveFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Active Flight',
                status: MissionStatus.IN_PROGRESS,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return active flights', async () => {
            mockFlightRepository.findActiveFlights.mockResolvedValue(mockActiveFlights);

            const result = await service.findActiveFlights();

            expect(result).toEqual(mockActiveFlights);
            expect(mockFlightRepository.findActiveFlights).toHaveBeenCalled();
        });
    });

    describe('findFlightsByDateRange', () => {
        const mockDateRangeFlights = [
            {
                id: 1,
                pilot_id: 1,
                license_id: 1,
                mission_name: 'Date Range Flight',
                status: MissionStatus.COMPLETED,
                start_time: new Date('2024-01-01T08:00:00Z'),
                end_time: new Date('2024-01-01T10:00:00Z'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it('should return flights by date range', async () => {
            const startDate = new Date('2024-01-01T00:00:00Z');
            const endDate = new Date('2024-01-02T00:00:00Z');

            mockFlightRepository.findFlightsByDateRange.mockResolvedValue(mockDateRangeFlights);

            const result = await service.findFlightsByDateRange(startDate, endDate);

            expect(result).toEqual(mockDateRangeFlights);
            expect(mockFlightRepository.findFlightsByDateRange).toHaveBeenCalledWith(
                startDate,
                endDate,
            );
        });
    });

    describe('startFlight', () => {
        const startFlightDto = {
            actualStartTime: new Date('2024-01-01T08:00:00Z'),
        };

        const plannedFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.PLANNED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should start planned flight successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(plannedFlight);
            mockFlightRepository.startFlight.mockResolvedValue(undefined);

            await service.startFlight(1, startFlightDto);

            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightRepository.startFlight).toHaveBeenCalledWith(1);
        });

        it('should throw BadRequestException when starting non-planned flight', async () => {
            const inProgressFlight = {
                ...plannedFlight,
                status: MissionStatus.IN_PROGRESS,
            };

            mockFlightRepository.findById.mockResolvedValue(inProgressFlight);

            await expect(service.startFlight(1, startFlightDto)).rejects.toThrow(
                BadRequestException,
            );
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.startFlight(999, startFlightDto)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('endFlight', () => {
        const endFlightDto = {
            actualEndTime: '2024-01-01T10:00:00Z',
            endLatitude: 10.8,
            endLongitude: 106.7,
            endAltitude: 120,
        };

        const inProgressFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.IN_PROGRESS,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should end in-progress flight successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(inProgressFlight);
            mockFlightRepository.endFlight.mockResolvedValue(undefined);

            await service.endFlight(1, endFlightDto);

            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightRepository.endFlight).toHaveBeenCalledWith(
                1,
                endFlightDto.endLatitude,
                endFlightDto.endLongitude,
                endFlightDto.endAltitude,
            );
        });

        it('should throw BadRequestException when ending non-in-progress flight', async () => {
            const plannedFlight = {
                ...inProgressFlight,
                status: MissionStatus.PLANNED,
            };

            mockFlightRepository.findById.mockResolvedValue(plannedFlight);

            await expect(service.endFlight(1, endFlightDto)).rejects.toThrow(BadRequestException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.endFlight(999, endFlightDto)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('addPathPoint', () => {
        const addPathPointDto = {
            latitude: 10.7,
            longitude: 106.6,
            altitude: 100,
            speed: 10,
            batteryLevel: 95,
        };

        const inProgressFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.IN_PROGRESS,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const mockPathPoint = {
            id: 1,
            mission_id: 1,
            seq_number: 1,
            geo_point: 'POINT(106.6 10.7)',
            altitude_m: 100,
            speed_mps: 10,
            action: 'waypoint',
            created_at: new Date(),
        };

        it('should add path point to in-progress flight successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(inProgressFlight);
            mockFlightPathRepository.addPathPoint.mockResolvedValue(mockPathPoint);

            const result = await service.addPathPoint(1, addPathPointDto);

            expect(result).toEqual(mockPathPoint);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightPathRepository.addPathPoint).toHaveBeenCalledWith(
                1,
                addPathPointDto.latitude,
                addPathPointDto.longitude,
                addPathPointDto.altitude,
                addPathPointDto.speed,
                addPathPointDto.batteryLevel,
            );
        });

        it('should throw BadRequestException when adding path point to non-in-progress flight', async () => {
            const plannedFlight = {
                ...inProgressFlight,
                status: MissionStatus.PLANNED,
            };

            mockFlightRepository.findById.mockResolvedValue(plannedFlight);

            await expect(service.addPathPoint(1, addPathPointDto)).rejects.toThrow(
                BadRequestException,
            );
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.addPathPoint(999, addPathPointDto)).rejects.toThrow(
                NotFoundException,
            );
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('getFlightPath', () => {
        const mockFlightPath = [
            {
                id: 1,
                mission_id: 1,
                seq_number: 1,
                geo_point: 'POINT(106.6 10.7)',
                altitude_m: 100,
                speed_mps: 10,
                action: 'takeoff',
                created_at: new Date(),
            },
        ];

        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.COMPLETED,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: new Date('2024-01-01T10:00:00Z'),
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should return flight path successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(mockFlight);
            mockFlightPathRepository.findByFlightId.mockResolvedValue(mockFlightPath);

            const result = await service.getFlightPath(1);

            expect(result).toEqual(mockFlightPath);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightPathRepository.findByFlightId).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.getFlightPath(999)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });

    describe('getLatestPathPoint', () => {
        const mockLatestPathPoint = {
            id: 1,
            mission_id: 1,
            seq_number: 5,
            geo_point: 'POINT(106.7 10.8)',
            altitude_m: 150,
            speed_mps: 15,
            action: 'waypoint',
            created_at: new Date(),
        };

        const mockFlight = {
            id: 1,
            pilot_id: 1,
            license_id: 1,
            mission_name: 'Test Flight',
            status: MissionStatus.IN_PROGRESS,
            start_time: new Date('2024-01-01T08:00:00Z'),
            end_time: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        it('should return latest path point successfully', async () => {
            mockFlightRepository.findById.mockResolvedValue(mockFlight);
            mockFlightPathRepository.getLatestPathPoint.mockResolvedValue(mockLatestPathPoint);

            const result = await service.getLatestPathPoint(1);

            expect(result).toEqual(mockLatestPathPoint);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(1);
            expect(mockFlightPathRepository.getLatestPathPoint).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when flight not found', async () => {
            mockFlightRepository.findById.mockResolvedValue(null);

            await expect(service.getLatestPathPoint(999)).rejects.toThrow(NotFoundException);
            expect(mockFlightRepository.findById).toHaveBeenCalledWith(999);
        });
    });
});
