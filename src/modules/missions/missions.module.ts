import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from '../../entities/mission.entity';
import { MissionRepository } from '../../repositories/mission.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Mission])],
    controllers: [MissionsController],
    providers: [MissionsService, MissionRepository],
    exports: [MissionsService],
})
export class MissionsModule { }
