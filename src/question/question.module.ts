import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RealstateProperty } from 'src/property/entities/realstate_property.entity';
import { PropertyQuestion } from './entities/property-question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [MikroOrmModule.forFeature([PropertyQuestion, RealstateProperty])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
