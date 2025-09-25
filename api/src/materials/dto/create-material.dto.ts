import { IsIn, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn(["pdf", "video"])
  type: "pdf" | "video";

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
