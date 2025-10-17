import {
  AfterUpsert,
  Entity,
  type EventArgs,
  ManyToOne,
  PrimaryKey,
  Property,
  ref,
  Unique,
  type Ref,
} from '@mikro-orm/core';
import { RealstateProperty } from './realstate_property.entity';
import { User } from '../../user/entities/user.entity';

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
    index: 'rating_property_fk',
  })
  property!: Ref<RealstateProperty>;

  @ManyToOne({
    entity: () => User,
    fieldName: 'user',
    index: 'rating_user_fk',
  })
  user!: Ref<User>;

  @AfterUpsert()
  async updateTotalRating(args: EventArgs<PropertyRating>) {
    const property = args.entity.property.getEntity();
    const ratings = property.ratings.getItems();
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    property.totalRating = totalRating / ratings.length;
    args.em.persist(property);
    await args.em.flush();
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
