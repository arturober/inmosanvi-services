import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthUser } from '../auth/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyService } from './property.service';
import { PropertiesResponse } from './responses/properties.response';
import { SinglePropertyResponse } from './responses/single_property.response';
import { AddPhotoDto } from './dto/add-photo.dto';
import { PropertyFilters } from './property.filters';
import { QuestionService } from 'src/question/question.service';
import { CreateQuestionDto } from 'src/question/dto/create-question.dto';
import { AddRatingDto } from './dto/add-rating.dto';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly questionService: QuestionService,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPropertyDto: CreatePropertyDto,
    @AuthUser() authUser: User,
  ) {
    return new SinglePropertyResponse(
      await this.propertyService.create(authUser, createPropertyDto),
    );
  }

  @Get()
  @Public()
  async findAll(
    @AuthUser() authUser: User,
    @Query('seller', new DefaultValuePipe(0), ParseIntPipe) seller?: number,
    @Query('province', new DefaultValuePipe(0), ParseIntPipe) province?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('search', new DefaultValuePipe('')) search?: string,
    @Query('sold', new DefaultValuePipe(false), ParseBoolPipe) sold?: boolean,
  ) {
    page = page ?? 1;
    const filters = new PropertyFilters(seller, province, search, sold, page);
    const [properties, total] = await this.propertyService.findAll(
      filters,
      authUser,
    );
    return new PropertiesResponse(properties, total, page, page * 12 < total);
  }

  @Get(':id')
  @Public()
  async findOne(
    @AuthUser() authUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return new SinglePropertyResponse(
      await this.propertyService.findOne(id, authUser),
    );
  }

  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updatePropertyDto: UpdatePropertyDto,
  ) {
    await this.propertyService.update(authUser, id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() authUser: User,
  ) {
    await this.propertyService.remove(authUser, id);
  }

  @Get(':id/photos')
  @Public()
  async getPhotos(@Param('id', ParseIntPipe) id: number) {
    return { photos: await this.propertyService.getPhotos(+id) };
  }

  @Post(':id/photos')
  @HttpCode(201)
  async addPhoto(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    addPhotoDto: AddPhotoDto,
  ) {
    return {
      photo: await this.propertyService.addphoto(authUser, id, addPhotoDto),
    };
  }

  @Delete(':id/photos/:photoId')
  @HttpCode(204)
  async removePhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @AuthUser() authUser: User,
  ) {
    await this.propertyService.removePhoto(authUser, id, photoId);
  }

  @Put(':id/photos/:photoId/setMain')
  @HttpCode(204)
  async setMainPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @AuthUser() authUser: User,
  ) {
    await this.propertyService.setMainPhoto(authUser, id, photoId);
  }

  @Post(':id/ratings')
  @HttpCode(201)
  async addRating(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    AddRatingDto: AddRatingDto,
  ) {
    return {
      rating: await this.propertyService.addRating(authUser, id, AddRatingDto),
    };
  }

  @Get(':id/ratings')
  @Public()
  async getRatings(@Param('id', ParseIntPipe) id: number) {
    return { ratings: await this.propertyService.getRatings(id) };
  }

  @Delete(':id/ratings/:ratingId')
  @HttpCode(204)
  async removeRating(
    @Param('id', ParseIntPipe) id: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @AuthUser() authUser: User,
  ) {
    await this.propertyService.removeRating(authUser, id, ratingId);
  }

  @Post(':id/questions')
  @HttpCode(201)
  async createQuestion(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() authUser: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createQuestionDto: CreateQuestionDto,
  ) {
    return {
      question: await this.questionService.create(
        authUser,
        id,
        createQuestionDto,
      ),
    };
  }

  @Get(':id/questions')
  @Public()
  async getQuestions(@Param('id', ParseIntPipe) id: number) {
    return { questions: await this.questionService.getQuestions(id) };
  }
}
