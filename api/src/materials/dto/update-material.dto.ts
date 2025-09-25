import { IsIn, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(["pdf", "video"])
  type?: "pdf" | "video";

  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;
}
