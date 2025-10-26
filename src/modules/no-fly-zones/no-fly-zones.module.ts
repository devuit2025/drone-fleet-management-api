import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoFlyZonesController } from './no-fly-zones.controller';
import { NoFlyZonesService } from './no-fly-zones.service';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoFlyZone])],
  controllers: [NoFlyZonesController],
  providers: [NoFlyZonesService],
  exports: [NoFlyZonesService],
})
export class NoFlyZonesModule { }

