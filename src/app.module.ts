import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from './mikro-orm.config';
import { TownModule } from './town/town.module';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { QuestionModule } from './question/question.module';
import configuration from './app.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    TownModule,
    PropertyModule,
    UserModule,
    AuthModule.forRoot({ googleId: configuration().google_id }),
    QuestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
