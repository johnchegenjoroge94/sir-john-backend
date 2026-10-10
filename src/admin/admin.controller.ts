import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RepairStatus, Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("summary")
  async summary() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [totalRequests, last7Days, grouped, totalProducts] = await Promise.all([
      this.prisma.repairRequest.count(),
      this.prisma.repairRequest.count({ where: { createdAt: { gte: since } } }),
      this.prisma.repairRequest.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.product.count(),
    ]);
    const byStatus: Partial<Record<RepairStatus, number>> = {};
    for (const g of grouped) byStatus[g.status] = g._count._all;
    return { totalRequests, last7Days, byStatus, totalProducts };
  }
}
