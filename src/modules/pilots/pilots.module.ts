import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PilotsController } from './pilots.controller';
import { Pilot } from '../../entities/pilot.entity';
import { PilotsService } from './pilots.service';
import { PilotRepository } from '../../repositories/pilot.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Pilot])],
  controllers: [PilotsController],
  providers: [PilotsService, PilotRepository],
  exports: [PilotsService, PilotRepository],
})
export class PilotsModule { }
