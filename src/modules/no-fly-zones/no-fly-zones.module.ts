import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoFlyZonesController } from './no-fly-zones.controller';
import { NoFlyZonesService } from './no-fly-zones.service';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';
import { NoFlyZoneRepository } from '../../repositories/no-fly-zone.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NoFlyZone])],
  controllers: [NoFlyZonesController],
  providers: [NoFlyZonesService, NoFlyZoneRepository],
  exports: [NoFlyZonesService],
})
export class NoFlyZonesModule { }

