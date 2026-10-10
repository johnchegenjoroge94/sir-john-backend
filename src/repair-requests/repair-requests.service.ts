import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRepairRequestDto } from "./dto/create-repair-request.dto";
import { ListRepairRequestsDto } from "./dto/list-repair-requests.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

const include = { customer: true } satisfies Prisma.RepairRequestInclude;
type RequestWithCustomer = Prisma.RepairRequestGetPayload<{ include: typeof include }>;

/** Shape the frontend expects. */
function toResponse(r: RequestWithCustomer) {
  return {
    id: r.id,
    customerName: r.customer.name,
    phone: r.customer.phone,
    email: r.customer.email,
    deviceType: r.deviceType,
    brandModel: r.brandModel,
    problem: r.problem,
    requestedService: r.requestedService,
    preferredContact: r.preferredContact,
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt,
  };
}

@Injectable()
export class RepairRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRepairRequestDto) {
    const created = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone: dto.phone },
        update: { name: dto.customerName, ...(dto.email ? { email: dto.email } : {}) },
        create: { name: dto.customerName, phone: dto.phone, email: dto.email ?? null },
      });
      return tx.repairRequest.create({
        data: {
          customerId: customer.id,
          deviceType: dto.deviceType,
          brandModel: dto.brandModel,
          problem: dto.problem,
          requestedService: dto.requestedService,
          preferredContact: dto.preferredContact,
          notes: dto.notes ?? null,
          history: { create: { status: "NEW", note: "Request submitted" } },
        },
      });
    });
    // Public response: do not echo personal data back.
    return { id: created.id, status: created.status };
  }

  async list(query: ListRepairRequestsDto) {
    const where: Prisma.RepairRequestWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { brandModel: { contains: s, mode: "insensitive" } },
        { problem: { contains: s, mode: "insensitive" } },
        { requestedService: { contains: s, mode: "insensitive" } },
        { customer: { name: { contains: s, mode: "insensitive" } } },
        { customer: { phone: { contains: s } } },
      ];
    }
    const rows = await this.prisma.repairRequest.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map(toResponse);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    const existing = await this.prisma.repairRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Repair request not found.");

    const updated = await this.prisma.repairRequest.update({
      where: { id },
      data: {
        status: dto.status,
        history: { create: { status: dto.status, note: dto.note ?? null, changedById: userId } },
      },
      include,
    });
    return toResponse(updated);
  }

  async history(id: string) {
    const rows = await this.prisma.repairStatusHistory.findMany({
      where: { repairRequestId: id },
      orderBy: { createdAt: "asc" },
      include: { changedBy: { select: { email: true, name: true } } },
    });
    return rows.map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      changedBy: h.changedBy?.name ?? h.changedBy?.email ?? null,
      createdAt: h.createdAt,
    }));
  }
}
