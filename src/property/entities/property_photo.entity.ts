import {
  Cascade,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { RealstateProperty } from './realstate_property.entity';

@Entity({ tableName: 'property_photo' })
export class PropertyPhoto {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Exclude()
  @ManyToOne({
    entity: () => RealstateProperty,
    fieldName: 'property',
    cascade: [Cascade.MERGE],
    deleteRule: 'cascade',
    index: 'photo_property_fk',
  })
  property!: Ref<RealstateProperty>;

  @Property({
    fieldName: 'photo_url',
    type: 'string',
    length: 255,
    serializer: (p: string) => {
      const baseUrl =
        (process.env.BASE_URL || 'http://localhost:3000') +
        (process.env.BASE_PATH || '');
      return `${baseUrl}/${p}`;
    },
  })
  url!: string;

  @Property({ fieldName: 'is_main', type: 'boolean', default: false })
  isMain?: boolean;

  constructor(url: string) {
    this.url = url;
  }
}
