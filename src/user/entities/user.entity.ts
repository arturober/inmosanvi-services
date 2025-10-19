import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { RealstateProperty } from '../../property/entities/realstate_property.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ length: 200, nullable: false })
  name!: string;

  @Property({ length: 250, nullable: false, unique: true })
  email!: string;

  @Property({ length: 100, nullable: false, hidden: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Property({
    length: 250,
    nullable: false,
    serializer: (p: string) => {
      const baseUrl =
        (process.env.BASE_URL || 'http://localhost:3000') +
        (process.env.BASE_PATH || '');
      return `${baseUrl}/${p}`;
    },
  })
  avatar!: string;

  @Property({ columnType: 'double', nullable: true, default: 0 })
  lat = 0;

  @Property({ columnType: 'double', nullable: true, default: 0 })
  lng = 0;

  @Property({ length: 200, nullable: true, hidden: true })
  @Exclude({ toPlainOnly: true })
  firebaseToken?: string | null;

  @Property({ persist: false })
  me?: boolean;

  @OneToMany(() => RealstateProperty, (property) => property.seller)
  properties = new Collection<RealstateProperty>(this);

  @ManyToMany(() => RealstateProperty, undefined, {
    owner: true,
    cascade: [Cascade.ALL],
  })
  favourites = new Collection<RealstateProperty>(this);
}
