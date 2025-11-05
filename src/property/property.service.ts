import {
  EntityRepository,
  FilterQuery,
  QBFilterQuery,
  QueryBuilder,
  QueryOrderMap,
  raw,
  ref,
} from '@mikro-orm/sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { Town } from 'src/town/entitites/town.entity';
import { User } from '../user/entities/user.entity';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AddRatingDto } from './dto/add-rating.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyPhoto } from './entities/property_photo.entity';
import { PropertyRating } from './entities/property_rating.entity';
import {
  PropertyState,
  RealstateProperty,
} from './entities/realstate_property.entity';
import { PropertyFilters } from './property.filters';
import { PropertyQuestion } from 'src/question/entities/property-question.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(RealstateProperty)
    private readonly propertyRepository: EntityRepository<RealstateProperty>,
    @InjectRepository(PropertyPhoto)
    private readonly photoRepository: EntityRepository<PropertyPhoto>,
    @InjectRepository(PropertyRating)
    private readonly ratingRepository: EntityRepository<PropertyRating>,
    private readonly imageService: ImageService,
  ) {}

  private createPropertySelectQuery(
    authUser?: User,
    includeSeller = false,
    includeRated = false,
    where: QBFilterQuery<RealstateProperty> = {},
    orderBy: QueryOrderMap<RealstateProperty> = { createdAt: 'DESC' },
    page = 1,
  ): QueryBuilder<RealstateProperty> {
    const query = this.propertyRepository.createQueryBuilder('p');

    query.where(where);
    query.orderBy(orderBy);
    query.limit(12).offset((page - 1) * 12);
    query.leftJoinAndSelect('p.town', 'town');
    query.leftJoinAndSelect('p.mainPhoto', 'mainPhoto');
    query.leftJoinAndSelect('town.province', 'province');
    if (includeSeller) {
      query.leftJoinAndSelect('p.seller', 'seller');
    }
    if (authUser) {
      query.addSelect(raw(`${authUser.id} = p.seller as mine`));
      if (includeRated) {
        query.addSelect(
          raw(
            `EXISTS(SELECT 1 FROM property_rating r WHERE r.property = p.id AND r.user = ${authUser.id}) as rated`,
          ),
        );
      }
    }

    return query;
  }

  async findAll(filters?: PropertyFilters, authUser?: User) {
    const filterQuery: FilterQuery<RealstateProperty> = {};
    if (filters?.seller) {
      filterQuery.seller = filters.seller;
    }
    if (filters?.search) {
      filterQuery.$or = [
        { title: { $like: `%${filters.search}%` } },
        { description: { $like: `%${filters.search}%` } },
      ];
    }

    if (filters?.sold) {
      filterQuery.status = PropertyState.SOLD;
    } else {
      filterQuery.status = { $ne: PropertyState.SOLD };
    }

    const properties = this.createPropertySelectQuery(
      authUser,
      false,
      false,
      filterQuery,
      { createdAt: 'DESC' },
      filters?.page ?? 1,
    );
    if (filters?.province) {
      properties.andWhere({ 'town.province': filters.province });
    }
    return await properties.getResultAndCount();
  }

  async findOne(id: number, authUser?: User) {
    const property = await this.createPropertySelectQuery(
      authUser,
      true,
      true,
      {
        id,
      },
    ).getSingleResult();
    if (!property) {
      throw new NotFoundException({
        status: 404,
        error: 'Property not found with id ' + id,
      });
    }
    return property;
  }

  async create(authUser: User, createPropertyDto: CreatePropertyDto) {
    const photoUrl = await this.imageService.saveImage(
      'properties',
      createPropertyDto.mainPhoto,
    );

    const mainPhoto = new PropertyPhoto(photoUrl);
    mainPhoto.isMain = true;
    const property = new RealstateProperty(
      createPropertyDto,
      authUser,
      mainPhoto,
    );
    mainPhoto.property = ref(property);

    await this.propertyRepository.getEntityManager().persistAndFlush(property);
    await property.town.loadOrFail();
    return property;
  }

  async update(
    authUser: User,
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ) {
    const property = await this.propertyRepository.findOneOrFail(id);
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't update it",
      );
    }
    Object.assign(property, updatePropertyDto);
    if (updatePropertyDto.townId) {
      property.town = ref(Town, updatePropertyDto.townId);
    }
    return this.propertyRepository.getEntityManager().persistAndFlush(property);
  }

  async remove(authUser: User, id: number) {
    const property = await this.propertyRepository.findOneOrFail(id, {
      populate: ['seller', 'mainPhoto'],
    });
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't delete it",
      );
    }
    await this.propertyRepository
      .getEntityManager()
      .transactional(async (em) => {
        if (property.mainPhoto) {
          await em.removeAndFlush(property.mainPhoto.getEntity());
        }
        await em.createQueryBuilder(PropertyPhoto).delete().where({
          property,
        });
        await em.createQueryBuilder(PropertyRating).delete().where({
          property,
        });
        await em.createQueryBuilder(PropertyQuestion).delete().where({
          property,
        });
        await em.removeAndFlush(property);
      });
  }

  async getPhotos(id: number) {
    const property = await this.propertyRepository.findOneOrFail(id, {
      populate: ['photos'],
    });
    return property.photos.getItems();
  }

  async addphoto(authUser: User, id: number, addPhotoDto: AddPhotoDto) {
    const property = await this.propertyRepository.findOneOrFail(id, {
      populate: ['photos', 'seller'],
    });
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't add photos",
      );
    }
    const photoUrl = await this.imageService.saveImage(
      'properties',
      addPhotoDto.photo,
    );
    const photo = new PropertyPhoto(photoUrl);
    photo.property = ref(property);
    property.photos.add(photo);
    await this.photoRepository.getEntityManager().persistAndFlush(photo);
    return photo;
  }

  async removePhoto(authUser: User, propertyId: number, photoId: number) {
    const property = await this.propertyRepository.findOneOrFail(propertyId, {
      populate: ['photos', 'seller', 'mainPhoto'],
    });
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't remove photos",
      );
    }
    const photo = await this.photoRepository.findOneOrFail(photoId, {
      populate: ['property'],
    });
    if (photo.property.getEntity().id !== property.id) {
      throw new ForbiddenException(
        "This photo doesn't belong to this property. You can't remove it",
      );
    }
    if (property.mainPhoto?.id === photo.id) {
      throw new ForbiddenException("You can't remove the main photo");
    }
    property.photos.remove(photo);
    await this.photoRepository.getEntityManager().removeAndFlush(photo);
    await this.imageService.removeImage(photo.url);
  }

  async setMainPhoto(authUser: User, propertyId: number, photoId: number) {
    const property = await this.propertyRepository.findOneOrFail(propertyId, {
      populate: ['photos', 'seller', 'mainPhoto'],
    });
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't set the main photo",
      );
    }
    const photo = await this.photoRepository.findOneOrFail(photoId, {
      populate: ['property'],
    });
    if (photo.property.getEntity().id !== property.id) {
      throw new ForbiddenException(
        "This photo doesn't belong to this property. You can't set it as main",
      );
    }
    if (property.mainPhoto?.id === photo.id) {
      return;
    }
    if (property.mainPhoto) {
      property.mainPhoto.getEntity().isMain = false;
      await this.photoRepository.getEntityManager().flush();
    }
    photo.isMain = true;
    property.mainPhoto = ref(photo);
    await this.photoRepository.getEntityManager().persistAndFlush(property);
  }

  async addRating(authUser: User, propertyId: number, ratingDto: AddRatingDto) {
    const property = await this.propertyRepository.findOneOrFail(propertyId);
    const ratingExist = await this.ratingRepository.findOne({
      user: authUser,
      property,
    });

    if (ratingExist)
      throw new ForbiddenException('You already rated this property');

    const rating = new PropertyRating(
      property,
      authUser,
      ratingDto.rating,
      ratingDto.comment,
    );
    await this.ratingRepository.getEntityManager().persistAndFlush(rating);
    return rating;
  }

  async getRatings(propertyId: number) {
    return await this.ratingRepository.find(
      { property: propertyId },
      { populate: ['user'] },
    );
  }

  async removeRating(authUser: User, propertyId: number, ratingId: number) {
    const rating = await this.ratingRepository.findOneOrFail(ratingId, {
      populate: ['user', 'property'],
    });
    if (rating.user.id !== authUser.id) {
      throw new ForbiddenException(
        "This rating doesn't belong to you. You can't remove it",
      );
    }
    if (rating.property.id !== propertyId) {
      throw new ForbiddenException(
        "This rating doesn't belong to this property. You can't remove it",
      );
    }
    await this.ratingRepository.getEntityManager().removeAndFlush(rating);
  }
}
