import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddRatingDto {
  @IsString()
  @IsOptional()
  readonly comment: string;

  @IsNumber()
  @IsNotEmpty()
  readonly rating: number;
}
