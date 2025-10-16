import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RealstateProperty } from './entities/realstate_property.entity';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { CommonsModule } from 'src/commons/commons.module';
import { PropertyPhoto } from './entities/property_photo.entity';
import { PropertyRating } from './entities/property_rating.entity';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      RealstateProperty,
      PropertyPhoto,
      PropertyRating,
    ]),
    QuestionModule,
    CommonsModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
