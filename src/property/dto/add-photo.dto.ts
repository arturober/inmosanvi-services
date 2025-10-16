import { IsBase64, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddPhotoDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' && value.startsWith('data:image/')
      ? value.split(',')[1]
      : value,
  )
  @IsBase64()
  photo: string;
}
