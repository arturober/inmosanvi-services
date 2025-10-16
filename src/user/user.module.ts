import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { CommonsModule } from 'src/commons/commons.module';
import { RealstateProperty } from 'src/property/entities/realstate_property.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, RealstateProperty]),
    CommonsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
