import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PilotsController } from './pilots.controller';
import { Pilot } from '../../entities/pilot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pilot])],
  controllers: [PilotsController],
})
export class PilotsModule { }
