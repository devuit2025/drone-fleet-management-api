import { Repository, FindOptionsWhere } from 'typeorm';
import { DeepPartial } from 'typeorm';

export abstract class BaseRepository<T extends { id: number }> {
    constructor(protected readonly repository: Repository<T>) {}

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findById(id: number): Promise<T | null> {
        return await this.repository.findOne({
            where: { id } as FindOptionsWhere<T>,
        });
    }

    async findAll(): Promise<T[]> {
        return await this.repository.find();
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }

    async count(): Promise<number> {
        return await this.repository.count();
    }

    async exists(id: number): Promise<boolean> {
        const count = await this.repository.count({
            where: { id } as FindOptionsWhere<T>,
        });
        return count > 0;
    }
}
