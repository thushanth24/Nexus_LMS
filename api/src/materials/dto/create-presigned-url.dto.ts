import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;
}
