import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { MaterialsService } from "./materials.service.js";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../common/guards/roles.guard.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { UserRole } from "../prisma-enums.js";
import { CreatePresignedUrlDto } from "./dto/create-presigned-url.dto.js";
import { CreateMaterialDto } from "./dto/create-material.dto.js";
import { UpdateMaterialDto } from "./dto/update-material.dto.js";

@Controller("materials")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post("presigned-url")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  createPresignedUrl(@Body() createPresignedUrlDto: CreatePresignedUrlDto) {
    return this.materialsService.createPresignedUrl(
      createPresignedUrlDto.fileName,
      createPresignedUrlDto.fileType,
    );
  }

  @Get("class/:classId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  listForClass(@Param("classId") classId: string, @Request() req) {
    return this.materialsService.listForClass(classId, req.user);
  }

  @Post("class/:classId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  createForClass(
    @Param("classId") classId: string,
    @Body() dto: CreateMaterialDto,
    @Request() req,
  ) {
    return this.materialsService.createForClass(classId, dto, req.user);
  }

  @Patch(":materialId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  updateMaterial(
    @Param("materialId") materialId: string,
    @Body() dto: UpdateMaterialDto,
    @Request() req,
  ) {
    return this.materialsService.updateMaterial(materialId, dto, req.user);
  }

  @Delete(":materialId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  deleteMaterial(@Param("materialId") materialId: string, @Request() req) {
    return this.materialsService.deleteMaterial(materialId, req.user);
  }
}
