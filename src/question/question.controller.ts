import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { QuestionService } from './question.service';
import { AnswerQuestionDto } from './dto/anwer-question.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @AuthUser() authUser: User) {
    await this.questionService.remove(authUser, +id);
  }

  @Put(':id/answer')
  @HttpCode(204)
  async answerQuestion(
    @Param('id') id: string,
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    answerQuestionDto: AnswerQuestionDto,
  ) {
    return {
      question: await this.questionService.answerQuestion(
        authUser,
        +id,
        answerQuestionDto.answer,
      ),
    };
  }
}
