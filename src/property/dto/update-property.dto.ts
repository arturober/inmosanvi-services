import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsString()
  @IsEnum(['selling', 'reserved', 'sold'])
  @IsOptional()
  status?: 'selling' | 'reserved' | 'sold';
}
