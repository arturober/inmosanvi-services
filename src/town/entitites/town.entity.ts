import { Entity, ManyToOne, PrimaryKey, Property, ref } from '@mikro-orm/core';
import type { Ref } from '@mikro-orm/core';
import { Province } from './province.entity';

@Entity({ tableName: 'town' })
export class Town {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 255 })
  name!: string;

  @Property({ type: 'double' })
  longitude!: number;

  @Property({ type: 'double' })
  latitude!: number;

  @ManyToOne(() => Province, { fieldName: 'province' })
  province!: Ref<Province>;

  constructor(province: Province) {
    this.province = ref(province);
  }
}
