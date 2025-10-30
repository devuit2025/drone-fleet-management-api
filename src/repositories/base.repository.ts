import { Repository, FindOptionsWhere } from 'typeorm';
import { DeepPartial } from 'typeorm';
// import { Logger } from '@nestjs/common';
import { logger } from 'src/utils/logger';

export interface SearchWhereOperator {
    $like?: string;
    $in?: any[];
    $gt?: number;
    $lt?: number;
    $gte?: number;
    $lte?: number;
}

export interface FieldSearchConfig {
    operator?: '=' | 'like';
    defaultOperator?: '=' | 'like';
}

export interface EntitySearchConfig {
    [fieldName: string]: FieldSearchConfig;
}

export interface SearchOptions {
    where?: Record<string, any | SearchWhereOperator>;
    orderBy?: Record<string, 'ASC' | 'DESC'>;
    sort?: string; // Single string format: "-updated_at" for DESC, "updated_at" for ASC
    limit?: number | 'all';
    skip?: number;
    relations?: string[];
    per?: number | 'all'; // Alias for limit with 'all' support
}

// Decorator to define search configuration for entity fields
export function Searchable(config: FieldSearchConfig = { operator: '=' }) {
    return function (target: any, propertyKey: string) {
        if (!target.constructor.searchConfig) {
            target.constructor.searchConfig = {};
        }
        target.constructor.searchConfig[propertyKey] = config;
    };
}

export abstract class BaseRepository<T extends { id: number }> {
    // Override this in child classes to define default relations to load
    protected relationForList: string[] = [];
    protected relationForDetail: string[] = [];

    constructor(protected readonly repository: Repository<T>) { }

    /**
     * Get search operator for a field from entity configuration
     */
    protected getFieldSearchOperator(fieldName: string, value: any): string {
        const entityClass = this.repository.metadata.target as any;
        const searchConfig = entityClass?.searchConfig || {};
        const fieldConfig = searchConfig[fieldName];

        if (!fieldConfig) {
            // Default to equality for fields without config
            return '=';
        }

        // Use configured default operator (only = or like)
        return fieldConfig.operator || fieldConfig.defaultOperator || '=';
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async findById(id: number): Promise<T | null> {
        return await this.repository.findOne({
            where: { id } as FindOptionsWhere<T>,
            relations: this.relationForDetail.length > 0 ? this.relationForDetail : undefined,
        });
    }

    async findAll(options?: SearchOptions): Promise<T[]> {
        if (options) {
            return await this.search(options);
        }
        // Default pagination: 30 records if no options provided
        return await this.search({ per: 30 });
    }

    async search(options: SearchOptions): Promise<T[]> {
        const { where, orderBy, sort, limit, skip, per } = options;

        // Handle 'per' parameter (alias for limit with 'all' support)
        // Default to 30 records if no pagination parameters specified
        let effectiveLimit: number | undefined;

        if (per === 'all') {
            effectiveLimit = undefined; // No limit = get all
        } else if (per !== undefined) {
            effectiveLimit = per;
        } else if (limit === 'all') {
            effectiveLimit = undefined;
        } else if (limit !== undefined) {
            effectiveLimit = limit;
        } else {
            // Default to 30 records if no per or limit specified
            effectiveLimit = 30;
        }

        const shouldPaginate = effectiveLimit !== undefined;

        const queryBuilder = this.repository.createQueryBuilder();

        if (where) {
            Object.keys(where).forEach((key, index) => {
                const value = where[key];

                // Get operator from entity configuration
                const operator = this.getFieldSearchOperator(key, value);
                const isLike = operator === 'like';
                const paramKey = `${key}${index}`; // Use index to avoid conflicts
                const qualifiedKey = key.includes('.') ? key : `${queryBuilder.alias}.${key}`;
                if (isLike) {
                    if (index === 0) {
                        queryBuilder.where(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                    } else {
                        queryBuilder.andWhere(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                    }
                } else {
                    // Equality comparison
                    if (index === 0) {
                        queryBuilder.where(`${qualifiedKey} = :${paramKey}`, { [paramKey]: value });
                    } else {
                        queryBuilder.andWhere(`${qualifiedKey} = :${paramKey}`, { [paramKey]: value });
                    }
                }
            });
        }

        // Handle sort parameter: "-updated_at" for DESC, "updated_at" for ASC
        if (sort) {
            const isDesc = sort.startsWith('-');
            const fieldName = isDesc ? sort.substring(1) : sort;
            const direction = isDesc ? 'DESC' : 'ASC';
            const qualifiedField = fieldName.includes('.') ? fieldName : `${queryBuilder.alias}.${fieldName}`;
            queryBuilder.addOrderBy(qualifiedField, direction);
        }

        // Handle orderBy (backwards compatible)
        if (orderBy) {
            Object.keys(orderBy).forEach(key => {
                const qualifiedKey = key.includes('.') ? key : `${queryBuilder.alias}.${key}`;
                queryBuilder.addOrderBy(qualifiedKey, orderBy[key]);
            });
        }

        // Default: Auto sort by ID ascending if no sort/orderBy specified
        if (!sort && !orderBy) {
            queryBuilder.addOrderBy(`${queryBuilder.alias}.id`, 'ASC');
        }

        // Only apply skip if not getting all records
        if (skip !== undefined && shouldPaginate) {
            queryBuilder.skip(skip);
        }

        // Only apply limit if paginating
        if (shouldPaginate && effectiveLimit !== undefined) {
            queryBuilder.take(effectiveLimit);
        }

        if (this.relationForList && this.relationForList.length > 0) {
            this.relationForList.forEach(relation => {
                queryBuilder.leftJoinAndSelect(
                    this.repository.metadata.targetName + '.' + relation,
                    relation
                );
            });
        }

        return await queryBuilder.getMany();
    }

    async searchOne(options: SearchOptions): Promise<T | null> {
        const results = await this.search({ ...options, limit: 1 });
        return results.length > 0 ? results[0] : null;
    }

    async countBy(options: SearchOptions): Promise<number> {
        const { where } = options;
        if (!where) {
            return await this.count();
        }

        const queryBuilder = this.repository.createQueryBuilder();

        Object.keys(where).forEach((key, index) => {
            const value = where[key];
            if (index === 0) {
                queryBuilder.where(`${key} = :${key}`, { [key]: value });
            } else {
                queryBuilder.andWhere(`${key} = :${key}`, { [key]: value });
            }
        });

        return await queryBuilder.getCount();
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
