import { Module } from '@nestjs/common';
import { TownService } from './town.service';
import { TownController } from './town.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Province } from './entitites/province.entity';
import { Town } from './entitites/town.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Town, Province])],
  controllers: [TownController],
  providers: [TownService],
  exports: [TownService],
})
export class TownModule {}
