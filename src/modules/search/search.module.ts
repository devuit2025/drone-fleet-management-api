import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DronesModule } from '../drones/drones.module';
import { UsersModule } from '../users/users.module';
import { PilotsModule } from '../pilots/pilots.module';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    DronesModule,
    UsersModule,
    PilotsModule,
    MissionsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule { }

