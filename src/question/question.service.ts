import { InjectRepository } from '@mikro-orm/nestjs';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { RealstateProperty } from 'src/property/entities/realstate_property.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PropertyQuestion } from './entities/property-question.entity';
import { EntityRepository } from '@mikro-orm/core';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(RealstateProperty)
    private readonly propertyRepository: EntityRepository<RealstateProperty>,
    @InjectRepository(PropertyQuestion)
    private readonly questionRepository: EntityRepository<PropertyQuestion>,
  ) {}

  async create(
    authUser: User,
    propertyId: number,
    createQuestionDto: CreateQuestionDto,
  ) {
    const property = await this.propertyRepository.findOneOrFail(propertyId);
    const question = new PropertyQuestion(
      property,
      authUser,
      createQuestionDto.question,
    );
    await this.questionRepository.getEntityManager().persistAndFlush(question);
    return question;
  }

  async remove(authUser: User, id: number) {
    const question = await this.questionRepository.findOneOrFail(id, {
      populate: ['user', 'property'],
    });
    if (
      question.user.id !== authUser.id ||
      question.property.getEntity().seller.id !== authUser.id
    ) {
      throw new ForbiddenException(
        "You don't have permission to delete this question. You are not the author or the seller of the property.",
      );
    }
    await this.questionRepository.getEntityManager().removeAndFlush(question);
  }

  async getQuestions(propertyId: number) {
    return await this.questionRepository.find(
      { property: propertyId },
      { populate: ['user'] },
    );
  }

  async answerQuestion(authUser: User, questionId: number, answer: string) {
    const question = await this.questionRepository.findOneOrFail(questionId, {
      populate: ['property'],
    });
    if (question.property.getEntity().seller.id !== authUser.id) {
      throw new ForbiddenException(
        "You don't have permission to answer this question. You are not the seller of the property.",
      );
    }
    question.answer = answer;
    await this.questionRepository.getEntityManager().persistAndFlush(question);
    return question;
  }
}
