import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AddRatingDto {
  @IsString()
  @IsOptional()
  readonly comment: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  readonly rating: number;
}
