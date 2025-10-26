import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Searchable } from '../repositories/base.repository';

export enum ZoneType {
    POLYGON = 'polygon',
    CIRCLE = 'circle',
}

@Entity('no_fly_zones')
export class NoFlyZone {
    @ApiProperty({ description: 'No-fly zone ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Zone name' })
    @Searchable({ operator: 'like' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Zone type', enum: ZoneType })
    @Column({
        name: 'zone_type',
        type: 'enum',
        enum: ZoneType,
    })
    zoneType: ZoneType;

    @ApiProperty({ description: 'Geometry (PostGIS Polygon SRID=4326)' })
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
    geometry: string;

    @ApiProperty({ description: 'Description' })
    @Column({ type: 'text' })
    description: string;
}
