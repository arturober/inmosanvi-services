import {
  AfterCreate,
  AfterDelete,
  AfterUpdate,
  Cascade,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  ref,
  Unique,
  type EventArgs,
  type Ref,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { RealstateProperty } from './realstate_property.entity';

@Entity({ tableName: 'property_rating' })
@Unique({ properties: ['property', 'user'] })
export class PropertyRating {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Property({ fieldName: 'rating', type: 'number' })
  rating!: number;

  @Property({ fieldName: 'comment', type: 'string', nullable: true })
  comment?: string;

  @ManyToOne({
    entity: () => RealstateProperty,
    fieldName: 'property',
    cascade: [Cascade.MERGE],
    deleteRule: 'cascade',
    index: 'rating_property_fk',
  })
  property!: Ref<RealstateProperty>;

  @ManyToOne({
    entity: () => User,
    fieldName: 'user',
    cascade: [Cascade.MERGE],
    deleteRule: 'cascade',
    index: 'rating_user_fk',
  })
  user!: Ref<User>;

  @AfterUpdate()
  @AfterCreate()
  @AfterDelete()
  async updateTotalRating(args: EventArgs<PropertyRating>) {
    const property = args.entity.property.getEntity();
    await property.ratings.loadItems();
    const ratings = property.ratings.getItems();
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    property.totalRating = ratings.length ? totalRating / ratings.length : 0;
    await args.em.nativeUpdate(RealstateProperty, property.id, {
      totalRating: property.totalRating,
    });
  }

  constructor(
    property: RealstateProperty,
    user: User,
    rating: number,
    comment?: string,
  ) {
    this.property = ref(property);
    this.user = ref(user);
    this.rating = rating;
    this.comment = comment;
  }
}
