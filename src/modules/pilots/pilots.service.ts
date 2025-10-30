import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserRole } from '../../entities/user.entity';
import { CreatePilotDto, PilotResponseDto, UpdatePilotDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../../common/base.service';
import { PilotRepository } from 'src/repositories/pilot.repository';
import { Pilot, PilotStatus } from 'src/entities/pilot.entity';

@Injectable()
export class PilotsService extends BaseService<Pilot> {
  constructor(private readonly pilotRepository: PilotRepository) { super(pilotRepository, 'Pilot'); }

  async create(createPilotDto: CreatePilotDto): Promise<PilotResponseDto> {
    const existingPilot = await this.pilotRepository.findById(createPilotDto.userId);
    if (existingPilot) {
      throw new ConflictException('Pilot with this user ID already exists');
    }

    return await this.pilotRepository.create({
      ...createPilotDto,
    });
  }

  // Inherit findAll(per,page) with pagination and total

  async findById(id: number): Promise<Pilot> {
    const pilot = await this.pilotRepository.findById(id);
    if (!pilot) {
      throw new NotFoundException('Pilot not found');
    }
    return pilot;
  }

  async update(id: number, updatePilotDto: UpdatePilotDto): Promise<Pilot> {
    const pilot = await this.findById(id);

    if (updatePilotDto.name && updatePilotDto.name !== pilot.name) {
      const existingPilot = await this.pilotRepository.findById(updatePilotDto.userId);
      if (existingPilot) {
        throw new ConflictException('Pilot with this name already exists');
      }
    }

    return await this.pilotRepository.update(id, updatePilotDto);
  }
}
