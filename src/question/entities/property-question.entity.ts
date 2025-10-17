import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  ref,
  type Ref,
} from '@mikro-orm/core';
import { RealstateProperty } from '../../property/entities/realstate_property.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ tableName: 'property_question' })
export class PropertyQuestion {
  @PrimaryKey({ fieldName: 'id', type: 'number' })
  id!: number;

  @Property({ fieldName: 'question', type: 'string', length: 255 })
  question!: string;

  @Property({
    fieldName: 'answer',
    type: 'string',
    length: 255,
    nullable: true,
  })
  answer?: string;

  @ManyToOne({
    entity: () => RealstateProperty,
    fieldName: 'property',
    index: 'question_property_fk',
  })
  property!: Ref<RealstateProperty>;

  @ManyToOne({
    entity: () => User,
    fieldName: 'user',
    index: 'question_user_fk',
  })
  user!: Ref<User>;

  constructor(property: RealstateProperty, user: User, question: string) {
    this.property = ref(property);
    this.user = ref(user);
    this.question = question;
  }
}
