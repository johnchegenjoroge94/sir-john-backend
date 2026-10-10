import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateRepairRequestDto } from "./dto/create-repair-request.dto";
import { ListRepairRequestsDto } from "./dto/list-repair-requests.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { RepairRequestsService } from "./repair-requests.service";

@ApiTags("repair-requests")
@Controller()
export class RepairRequestsController {
  constructor(private readonly service: RepairRequestsService) {}

  /** Public: submit a repair enquiry. Strictly rate-limited against spam. */
  @Post("repair-requests")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body() dto: CreateRepairRequestDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get("admin/repair-requests")
  list(@Query() query: ListRepairRequestsDto) {
    return this.service.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get("admin/repair-requests/:id/history")
  history(@Param("id") id: string) {
    return this.service.history(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Patch("admin/repair-requests/:id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.service.updateStatus(id, dto, req.user.id);
  }
}
