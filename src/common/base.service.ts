import { NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../repositories/base.repository';

export abstract class BaseService<T extends { id: number }> {
  protected constructor(
    protected readonly repository: BaseRepository<T>,
    private readonly resourceName: string,
  ) { }

  // async findAll(per?: number, page?: number): Promise<{ data: T[]; total: number }> {
  //   const safePer = per && per > 0 ? per : 30;
  //   const safePage = page && page > 0 ? page : 1;
  //   const skip = (safePage - 1) * safePer;

  //   const [data, total] = await Promise.all([
  //     this.repository.search({ per: safePer, skip }),
  //     this.repository.count(),
  //   ]);

  //   return { data, total };
  // }

  async findAll(params: any = {}): Promise<{ data: T[]; total: number }> {
    // Tách và chuẩn hóa các param phân trang
    const safePer = params?.per && params.per > 0 ? +params.per : 30;
    const safePage = params?.page && params.page > 0 ? +params.page : 1;
    const skip = (safePage - 1) * safePer;
  
    // Tách luôn các filter param
    const { page, per, ...filters } = params;
  
    const [data, total] = await Promise.all([
      this.repository.search({ where: filters, per: safePer, skip }),
      this.repository.countBy({ where: filters }),
    ]);
  
    return { data, total };
  }

  async findById(id: number): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.resourceName} not found`);
    }
    return entity;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    await this.ensureExists(id);
    const updated = await this.repository.update(id, data);
    return updated as T;
  }

  async delete(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.repository.delete(id);
  }

  protected async ensureExists(id: number): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundException(`${this.resourceName} not found`);
    }
  }
}


