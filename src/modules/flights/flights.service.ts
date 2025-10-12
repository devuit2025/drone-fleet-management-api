import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FlightRepository } from '../../repositories/flight.repository';
import { FlightPathRepository } from '../../repositories/flight-path.repository';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { Waypoint } from '../../entities/waypoint.entity';
import {
  CreateFlightDto,
  UpdateFlightDto,
  StartFlightDto,
  EndFlightDto,
  AddPathPointDto,
} from './dto';

@Injectable()
export class FlightsService {
  constructor(
    private readonly flightRepository: FlightRepository,
    private readonly flightPathRepository: FlightPathRepository,
  ) { }

  async create(createFlightDto: CreateFlightDto): Promise<Mission> {
    return await this.flightRepository.create({
      ...createFlightDto,
      start_time: new Date(createFlightDto.plannedStartTime),
    });
  }

  async findAll(): Promise<Mission[]> {
    return await this.flightRepository.findAll();
  }

  async findById(id: number): Promise<Mission> {
    const flight = await this.flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundException('Flight not found');
    }
    return flight;
  }

  async update(id: number, updateFlightDto: UpdateFlightDto): Promise<Mission> {
    const flight = await this.findById(id);

    if (flight.status !== MissionStatus.PLANNED) {
      throw new BadRequestException('Can only update planned flights');
    }

    const updateData: any = { ...updateFlightDto };
    if (updateFlightDto.plannedStartTime) {
      updateData.plannedStartTime = new Date(updateFlightDto.plannedStartTime);
    }

    return await this.flightRepository.update(id, updateData);
  }

  async delete(id: number): Promise<void> {
    const flight = await this.findById(id);

    if (flight.status === MissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete flight in progress');
    }

    await this.flightRepository.delete(id);
  }

  async findByStatus(status: MissionStatus): Promise<Mission[]> {
    return await this.flightRepository.findByStatus(status);
  }

  async findByPilot(pilotId: number): Promise<Mission[]> {
    return await this.flightRepository.findByPilot(pilotId);
  }

  async findByDrone(droneId: number): Promise<Mission[]> {
    return await this.flightRepository.findByDrone(droneId);
  }

  async findActiveFlights(): Promise<Mission[]> {
    return await this.flightRepository.findActiveFlights();
  }

  async findFlightsByDateRange(startDate: Date, endDate: Date): Promise<Mission[]> {
    return await this.flightRepository.findFlightsByDateRange(startDate, endDate);
  }

  async startFlight(id: number, startFlightDto: StartFlightDto): Promise<void> {
    const flight = await this.findById(id);

    if (flight.status !== MissionStatus.PLANNED) {
      throw new BadRequestException('Can only start planned flights');
    }

    await this.flightRepository.startFlight(id);
  }

  async endFlight(id: number, endFlightDto: EndFlightDto): Promise<void> {
    const flight = await this.findById(id);

    if (flight.status !== MissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only end flights in progress');
    }

    await this.flightRepository.endFlight(
      id,
      endFlightDto.endLatitude,
      endFlightDto.endLongitude,
      endFlightDto.endAltitude,
    );

    // Notes field removed from Mission entity
  }

  async addPathPoint(id: number, addPathPointDto: AddPathPointDto): Promise<Waypoint> {
    const flight = await this.findById(id);

    if (flight.status !== MissionStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only add path points to flights in progress');
    }

    return await this.flightPathRepository.addPathPoint(
      id,
      addPathPointDto.latitude,
      addPathPointDto.longitude,
      addPathPointDto.altitude,
      addPathPointDto.speed,
      addPathPointDto.batteryLevel,
    );
  }

  async getFlightPath(id: number): Promise<Waypoint[]> {
    await this.findById(id);
    return await this.flightPathRepository.findByFlightId(id);
  }

  async getLatestPathPoint(id: number): Promise<Waypoint | null> {
    await this.findById(id);
    return await this.flightPathRepository.getLatestPathPoint(id);
  }
}
