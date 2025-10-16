import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ProvinceSeeder } from './province.seeder';
import { TwonSeeder } from './town.seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [ProvinceSeeder, TwonSeeder]);
  }
}
