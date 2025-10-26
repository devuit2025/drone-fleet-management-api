import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneCategoriesController } from './drone-categories.controller';
import { DroneCategoriesService } from './drone-categories.service';
import { DroneCategory } from '../../entities/drone-category.entity';
import { DroneCategoryRepository } from '../../repositories/drone-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DroneCategory])],
  controllers: [DroneCategoriesController],
  providers: [DroneCategoriesService, DroneCategoryRepository],
  exports: [DroneCategoriesService],
})
export class DroneCategoriesModule { }

