import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsNumber()
  @IsOptional()
  readonly lat?: number;

  @IsNumber()
  @IsOptional()
  readonly lng?: number;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsNumber()
  @IsNotEmpty()
  readonly townId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly sqmeters: number;

  @IsNumber()
  @IsNotEmpty()
  readonly numRooms: number;

  @IsNumber()
  @IsNotEmpty()
  readonly numBaths: number;

  @IsString()
  readonly mainPhoto: string;

  selling = 'selling';
}
