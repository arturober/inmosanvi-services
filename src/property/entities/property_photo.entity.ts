import {
  Cascade,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { RealstateProperty } from './realstate_property.entity';
import { Ref } from 'node_modules/@mikro-orm/core/entity';

@Entity({ tableName: 'property_photo' })
export class PropertyPhoto {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Exclude()
  @ManyToOne({
    entity: () => RealstateProperty,
    fieldName: 'property',
    cascade: [Cascade.MERGE],
    index: 'photo_property_fk',
  })
  property!: Ref<RealstateProperty>;

  @Property({ fieldName: 'photo_url', type: 'string', length: 255 })
  url!: string;

  @Property({ fieldName: 'is_main', type: 'boolean', default: false })
  isMain?: boolean;

  constructor(url: string) {
    this.url = url;
  }
}
