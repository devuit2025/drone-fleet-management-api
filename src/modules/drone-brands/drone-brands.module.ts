import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneBrandsController } from './drone-brands.controller';
import { DroneBrandsService } from './drone-brands.service';
import { DroneBrand } from '../../entities/drone-brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DroneBrand])],
  controllers: [DroneBrandsController],
  providers: [DroneBrandsService],
  exports: [DroneBrandsService],
})
export class DroneBrandsModule { }

