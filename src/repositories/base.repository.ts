import { Repository, FindOptionsWhere } from 'typeorm';
import { DeepPartial } from 'typeorm';
// import { Logger } from '@nestjs/common';
import { logger } from '../utils/logger';

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
    global?: string; // Global search term - searches across all @Searchable fields with 'like' operator
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

    /**
     * Get all fields that are searchable for global search
     * Includes fields with 'like' operator and enum fields (which will be cast to TEXT)
     */
    protected getSearchableFields(): Array<{ fieldName: string; isEnum: boolean }> {
        const entityClass = this.repository.metadata.target as any;
        const searchConfig = entityClass?.searchConfig || {};

        return Object.keys(searchConfig).map(fieldName => {
            const fieldConfig = searchConfig[fieldName];
            const hasLikeOperator = fieldConfig?.operator === 'like' || fieldConfig?.defaultOperator === 'like';

            // Check if field is enum
            const column = this.repository.metadata.findColumnWithPropertyName(fieldName);
            const isEnum = column?.type === 'enum' || !!(column as any)?.enum;

            // Include if has 'like' operator OR if it's an enum (can be searched with cast)
            if (hasLikeOperator || isEnum) {
                return { fieldName, isEnum: !!isEnum };
            }

            return null;
        }).filter((item): item is { fieldName: string; isEnum: boolean } => item !== null);
    }

    /**
     * Get database column name for a field (handles snake_case conversion)
     */
    protected getColumnName(fieldName: string): string {
        // Check if field has a custom column name in metadata
        const column = this.repository.metadata.findColumnWithPropertyName(fieldName);
        if (column?.databaseName) {
            return column.databaseName;
        }
        // If column exists but no databaseName, use property name
        if (column) {
            return fieldName;
        }
        // Default: convert camelCase to snake_case
        return fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();
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
        const { where, orderBy, sort, limit, skip, per, global } = options;

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
        const alias = queryBuilder.alias;
        let hasWhereCondition = false;

        // Handle global search - creates OR conditions for all searchable fields
        // String fields use LIKE, enum fields are cast to TEXT then use LIKE
        if (global && global.trim()) {
            const searchableFields = this.getSearchableFields();
            if (searchableFields.length > 0) {
                const globalConditions: string[] = [];
                const globalParams: Record<string, string> = {};

                searchableFields.forEach((item, index) => {
                    const { fieldName, isEnum } = item;
                    const columnName = this.getColumnName(fieldName);
                    const paramKey = `global_${index}`;

                    // For enum fields, cast to TEXT before using LIKE
                    if (isEnum) {
                        globalConditions.push(`CAST(${alias}.${columnName} AS TEXT) LIKE :${paramKey}`);
                    } else {
                        globalConditions.push(`${alias}.${columnName} LIKE :${paramKey}`);
                    }
                    globalParams[paramKey] = `%${global.trim()}%`;
                });

                if (globalConditions.length > 0) {
                    queryBuilder.where(`(${globalConditions.join(' OR ')})`, globalParams);
                    hasWhereCondition = true;
                }
            }
        }

        // Handle regular where conditions
        if (where) {
            Object.keys(where).forEach((key, index) => {
                const value = where[key];

                // Get operator from entity configuration
                const operator = this.getFieldSearchOperator(key, value);
                const isLike = operator === 'like';
                const paramKey = `${key}${index}`; // Use index to avoid conflicts
                const columnName = this.getColumnName(key);
                const qualifiedKey = key.includes('.') ? key : `${alias}.${columnName}`;

                if (isLike) {
                    if (!hasWhereCondition) {
                        queryBuilder.where(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                        hasWhereCondition = true;
                    } else {
                        queryBuilder.andWhere(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                    }
                } else {
                    // Equality comparison
                    if (!hasWhereCondition) {
                        queryBuilder.where(`${qualifiedKey} = :${paramKey}`, { [paramKey]: value });
                        hasWhereCondition = true;
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

        // Use relations from options if provided, otherwise use relationForList
        const relationsToLoad = options.relations && options.relations.length > 0
            ? options.relations
            : (this.relationForList && this.relationForList.length > 0 ? this.relationForList : []);

        if (relationsToLoad.length > 0) {
            const rootAlias = queryBuilder.alias;
            const aliasMap = new Map<string, string>();
            aliasMap.set('', rootAlias);

            relationsToLoad.forEach(relation => {
                const segments = relation.split('.');
                let parentPath = '';
                let parentAlias = rootAlias;

                segments.forEach((segment, index) => {
                    const currentPath = parentPath ? `${parentPath}.${segment}` : segment;
                    if (!aliasMap.has(currentPath)) {
                        const joinSource = `${parentAlias}.${segment}`;
                        const aliasName = `${segment}_${aliasMap.size}`;
                        queryBuilder.leftJoinAndSelect(joinSource, aliasName);
                        aliasMap.set(currentPath, aliasName);
                    }

                    parentPath = currentPath;
                    parentAlias = aliasMap.get(currentPath) ?? rootAlias;
                });
            });
        }

        return await queryBuilder.getMany();
    }

    async searchOne(options: SearchOptions): Promise<T | null> {
        const results = await this.search({ ...options, limit: 1 });
        return results.length > 0 ? results[0] : null;
    }

    async countBy(options: SearchOptions): Promise<number> {
        const { where, global } = options;

        // If no filters and no global search, return total count
        if (!where && !global) {
            return await this.count();
        }

        const queryBuilder = this.repository.createQueryBuilder();
        const alias = queryBuilder.alias;
        let hasWhereCondition = false;

        // Handle global search - same logic as search()
        // String fields use LIKE, enum fields are cast to TEXT then use LIKE
        if (global && global.trim()) {
            const searchableFields = this.getSearchableFields();
            if (searchableFields.length > 0) {
                const globalConditions: string[] = [];
                const globalParams: Record<string, string> = {};

                searchableFields.forEach((item, index) => {
                    const { fieldName, isEnum } = item;
                    const columnName = this.getColumnName(fieldName);
                    const paramKey = `global_${index}`;

                    // For enum fields, cast to TEXT before using LIKE
                    if (isEnum) {
                        globalConditions.push(`CAST(${alias}.${columnName} AS TEXT) LIKE :${paramKey}`);
                    } else {
                        globalConditions.push(`${alias}.${columnName} LIKE :${paramKey}`);
                    }
                    globalParams[paramKey] = `%${global.trim()}%`;
                });

                if (globalConditions.length > 0) {
                    queryBuilder.where(`(${globalConditions.join(' OR ')})`, globalParams);
                    hasWhereCondition = true;
                }
            }
        }

        // Handle regular where conditions
        if (where) {
            Object.keys(where).forEach((key, index) => {
                const value = where[key];
                const operator = this.getFieldSearchOperator(key, value);
                const isLike = operator === 'like';
                const columnName = this.getColumnName(key);
                const qualifiedKey = `${alias}.${columnName}`;
                const paramKey = `${key}${index}`;

                if (isLike) {
                    if (!hasWhereCondition) {
                        queryBuilder.where(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                        hasWhereCondition = true;
                    } else {
                        queryBuilder.andWhere(`${qualifiedKey} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
                    }
                } else {
                    if (!hasWhereCondition) {
                        queryBuilder.where(`${qualifiedKey} = :${paramKey}`, { [paramKey]: value });
                        hasWhereCondition = true;
                    } else {
                        queryBuilder.andWhere(`${qualifiedKey} = :${paramKey}`, { [paramKey]: value });
                    }
                }
            });
        }

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
