import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneBrand } from '../../entities/drone-brand.entity';
import { CreateDroneBrandDto, UpdateDroneBrandDto } from './dto';
import { DroneBrandRepository } from '../../repositories/drone-brand.repository';

@Injectable()
export class DroneBrandsService {
  constructor(
    @InjectRepository(DroneBrand)
    private readonly droneBrandRepository: Repository<DroneBrand>,
    private readonly droneBrandRepo: DroneBrandRepository,
  ) { }

  async create(createDroneBrandDto: CreateDroneBrandDto): Promise<DroneBrand> {
    const existingBrand = await this.droneBrandRepo.findByName(createDroneBrandDto.name);
    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    const droneBrand = this.droneBrandRepository.create(createDroneBrandDto);
    return await this.droneBrandRepository.save(droneBrand);
  }

  async findAll(): Promise<DroneBrand[]> {
    return await this.droneBrandRepo.findAll();
  }

  async findById(id: number): Promise<DroneBrand> {
    const droneBrand = await this.droneBrandRepository.findOne({
      where: { id },
    });
    if (!droneBrand) {
      throw new NotFoundException('Drone brand not found');
    }
    return droneBrand;
  }

  async update(
    id: number,
    updateDroneBrandDto: UpdateDroneBrandDto,
  ): Promise<DroneBrand> {
    const droneBrand = await this.findById(id);

    if (updateDroneBrandDto.name && updateDroneBrandDto.name !== droneBrand.name) {
      const existingBrand = await this.droneBrandRepo.findByName(updateDroneBrandDto.name);
      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    if (updateDroneBrandDto.name) droneBrand.name = updateDroneBrandDto.name;
    if (updateDroneBrandDto.country !== undefined)
      droneBrand.country = updateDroneBrandDto.country;
    if (updateDroneBrandDto.website !== undefined)
      droneBrand.website = updateDroneBrandDto.website;

    return await this.droneBrandRepository.save(droneBrand);
  }

  async delete(id: number): Promise<void> {
    const droneBrand = await this.findById(id);
    await this.droneBrandRepository.remove(droneBrand);
  }
}

