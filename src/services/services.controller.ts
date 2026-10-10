import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsBoolean } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

class UpdateServiceDto {
  @IsBoolean()
  active: boolean;
}

@ApiTags("services")
@Controller()
export class ServicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("services")
  list() {
    return this.prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, title: true, summary: true, description: true },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get("admin/services")
  adminList() {
    return this.prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, title: true, active: true },
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch("admin/services/:id")
  async update(@Param("id") id: string, @Body() dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Service not found.");
    return this.prisma.service.update({
      where: { id },
      data: { active: dto.active },
      select: { id: true, slug: true, title: true, active: true },
    });
  }
}
