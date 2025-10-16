import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { RealstateProperty } from 'src/property/entities/realstate_property.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly imageService: ImageService,
    @InjectRepository(User) private readonly usersRepo: EntityRepository<User>,
    @InjectRepository(RealstateProperty)
    private readonly propertiesRepo: EntityRepository<RealstateProperty>,
  ) {}

  async getUser(id: number): Promise<User> {
    return this.usersRepo.findOneOrFail({ id });
  }

  async getUserbyEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ email });
  }

  async getUsersByName(name: string): Promise<User[]> {
    return this.usersRepo.find({ name: { $like: '%' + name + '%' } });
  }

  async emailExists(email: string): Promise<boolean> {
    return (await this.usersRepo.findOne({ email })) ? true : false;
  }

  async updateUserInfo(id: number, user: UpdateUserDto): Promise<void> {
    await this.usersRepo.nativeUpdate({ id }, user);
  }

  async updatePassword(id: number, pass: UpdatePasswordDto): Promise<void> {
    await this.usersRepo.nativeUpdate({ id }, pass);
  }

  async updatePhoto(id: number, photoDto: UpdatePhotoDto): Promise<string> {
    photoDto.avatar = await this.imageService.saveImage(
      'users',
      photoDto.avatar,
    );
    await this.usersRepo.nativeUpdate(id, photoDto);
    return photoDto.avatar;
  }

  async addPropertyFavourites(
    authUser: User,
    propertyId: number,
  ): Promise<void> {
    const property = await this.propertiesRepo.findOneOrFail(propertyId);
    authUser.favourites.add(property);
    await this.usersRepo.getEntityManager().flush();
  }

  async removePropertyFavourites(
    authUser: User,
    propertyId: number,
  ): Promise<void> {
    authUser.favourites.remove(this.propertiesRepo.getReference(propertyId));
    await this.usersRepo.getEntityManager().flush();
  }

  async getFavouriteProperties(userId: number) {
    const user = await this.usersRepo.findOneOrFail(userId, {
      populate: ['favourites'],
    });
    return user.favourites.getItems();
  }
}
