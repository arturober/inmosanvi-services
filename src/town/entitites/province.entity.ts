import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'province' })
export class Province {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 100 })
  name!: string;
}
