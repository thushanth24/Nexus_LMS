import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { HomeworkService } from "./homework.service.js";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../common/guards/roles.guard.js";
import { Roles } from "../common/decorators/roles.decorator.js";
import { UserRole } from "../prisma-enums.js";
import { CreateHomeworkDto } from "./dto/create-homework.dto.js";
import { UpdateHomeworkDto } from "./dto/update-homework.dto.js";

@Controller("homework")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Get("class/:classId")
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findForClass(@Param("classId") classId: string) {
    return this.homeworkService.findByClass(classId);
  }

  @Post("class/:classId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  createForClass(
    @Param("classId") classId: string,
    @Body() dto: CreateHomeworkDto,
    @Request() req,
  ) {
    return this.homeworkService.createForClass(classId, dto, req.user);
  }

  @Patch(":homeworkId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  updateHomework(
    @Param("homeworkId") homeworkId: string,
    @Body() dto: UpdateHomeworkDto,
    @Request() req,
  ) {
    return this.homeworkService.updateHomework(homeworkId, dto, req.user);
  }

  @Delete(":homeworkId")
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  deleteHomework(@Param("homeworkId") homeworkId: string, @Request() req) {
    return this.homeworkService.deleteHomework(homeworkId, req.user);
  }

  @Get("me")
  @Roles(UserRole.STUDENT)
  findMyHomework(@Request() req) {
    return this.homeworkService.findForStudent(req.user.userId);
  }
}
