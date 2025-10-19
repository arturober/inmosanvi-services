import {
  Cascade,
  Collection,
  Entity,
  EntityRef,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  ref,
  type Ref,
} from '@mikro-orm/core';
import { Town } from '../../town/entitites/town.entity';
import { User } from '../../user/entities/user.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { PropertyPhoto } from './property_photo.entity';
import { PropertyRating } from './property_rating.entity';

@Entity({ tableName: 'property' })
export class RealstateProperty {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Property({ type: 'string', length: 255 })
  address!: string;

  @Property({ type: 'string', length: 100 })
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'double' })
  sqmeters!: number;

  @Property({ fieldName: 'num_rooms', type: 'number' })
  numRooms!: number;

  @Property({ fieldName: 'num_baths', type: 'number' })
  numBaths!: number;

  @Property({ type: 'double' })
  price!: number;

  @Property({ type: 'double', default: 0 })
  totalRating?: number;

  @Property({ persist: false })
  mine?: boolean;

  @Property({ persist: false })
  rated?: boolean;

  @OneToOne({
    entity: () => PropertyPhoto,
    fieldName: 'main_photo',
    cascade: [Cascade.MERGE, Cascade.REMOVE],
    nullable: true,
    index: 'main_photo',
    unique: 'main_photo_2',
    ref: true,
    serializer: (p: EntityRef<PropertyPhoto>) => {
      if (!p || !p.isInitialized()) {
        return null;
      }
      const photo = p.getEntity();
      const baseUrl =
        (process.env.BASE_URL || 'http://localhost:3000') +
        (process.env.BASE_PATH || '');
      return `${baseUrl}/${photo.url}`;
    },
  })
  mainPhoto?: Ref<PropertyPhoto>;

  @Property({
    fieldName: 'created_at',
    type: 'datetime',
    onCreate: () => new Date(),
    index: true,
  })
  createdAt: Date;

  @Enum({
    items: () => PropertyState,
    name: 'state',
    type: 'string',
    length: 50,
    default: 'selling',
  })
  status?: PropertyState;

  @ManyToOne(() => Town, { fieldName: 'town', ref: true })
  town!: Ref<Town>;

  @ManyToOne(() => User, { fieldName: 'seller', ref: true })
  seller!: Ref<User>;

  @OneToMany(() => PropertyPhoto, (photo) => photo.property, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  photos = new Collection<PropertyPhoto>(this);

  @OneToMany(() => PropertyRating, (rating) => rating.property, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  ratings = new Collection<PropertyRating>(this);

  constructor(
    createPropertyDto: CreatePropertyDto,
    user: User,
    mainPhoto?: PropertyPhoto,
  ) {
    this.title = createPropertyDto.title;
    this.description = createPropertyDto.description;
    this.price = createPropertyDto.price;
    this.sqmeters = createPropertyDto.sqmeters;
    this.numRooms = createPropertyDto.numRooms;
    this.numBaths = createPropertyDto.numBaths;
    this.address = createPropertyDto.address;
    this.town = ref(Town, createPropertyDto.townId);
    this.mainPhoto = mainPhoto ? ref(mainPhoto) : undefined;
    this.status = PropertyState.SELLING;
    this.seller = ref(user);
  }
}

export enum PropertyState {
  SELLING = 'selling',
  RESERVED = 'reserved',
  SOLD = 'sold',
}
