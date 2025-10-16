import { EntityRepository, FilterQuery, ref } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { Town } from 'src/town/entitites/town.entity';
import { User } from '../user/entities/user.entity';
import { AddPhotoDto } from './dto/add-photo.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyPhoto } from './entities/property_photo.entity';
import {
  PropertyState,
  RealstateProperty,
} from './entities/realstate_property.entity';
import { PropertyFilters } from './property.filters';
import { AddRatingDto } from './dto/add-rating.dto';
import { PropertyRating } from './entities/property_rating.entity';

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

  // TODO: Implementar filtros
  findAll(filters?: PropertyFilters) {
    const filterQuery: FilterQuery<RealstateProperty> = {};
    if (filters?.seller) {
      filterQuery.seller = filters.seller;
    }
    if (filters?.province) {
      filterQuery.town = { province: filters.province };
    }
    if (filters?.search) {
      filterQuery.$or = [
        { title: { $ilike: `%${filters.search}%` } },
        { description: { $ilike: `%${filters.search}%` } },
      ];
    }
    if (filters?.sold) {
      filterQuery.status = PropertyState.SOLD;
    } else {
      filterQuery.status = { $ne: PropertyState.SOLD };
    }

    return this.propertyRepository.findAndCount(filterQuery, {
      populate: ['mainPhoto', 'seller', 'town'],
      orderBy: { createdAt: 'DESC' },
      limit: 12,
      offset: (filters?.page ?? 1) - 1,
    });
  }

  async findOne(id: number) {
    return await this.propertyRepository.findOneOrFail(id, {
      populate: ['mainPhoto', 'seller', 'town'],
    });
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
    const property = this.propertyRepository.getReference(id);
    if (property.seller.id !== authUser.id) {
      throw new ForbiddenException(
        "This property doesn't belong to you. You can't delete it",
      );
    }
    await this.imageService.removeImage(property.mainPhoto!.getEntity().url);
    return await this.propertyRepository
      .getEntityManager()
      .removeAndFlush(property);
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
}
