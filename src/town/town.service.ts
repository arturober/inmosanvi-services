import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/sqlite';
import { Province } from './entitites/province.entity';
import { Town } from './entitites/town.entity';

@Injectable()
export class TownService {
  constructor(
    @InjectRepository(Town)
    private readonly townRepository: EntityRepository<Town>,
    @InjectRepository(Province)
    private readonly provinceRepository: EntityRepository<Province>,
  ) {}

  async findAll(): Promise<Town[]> {
    return this.townRepository.findAll();
  }

  async findByProvince(provinceId: number): Promise<Town[]> {
    return this.townRepository.find({ province: provinceId });
  }

  async findById(id: number): Promise<Town | null> {
    return this.townRepository.findOneOrFail({ id });
  }

  async findAllprovinces(): Promise<Province[]> {
    return this.provinceRepository.findAll();
  }
}
