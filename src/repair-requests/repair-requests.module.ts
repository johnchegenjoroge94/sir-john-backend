import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RepairRequestsController } from "./repair-requests.controller";
import { RepairRequestsService } from "./repair-requests.service";

@Module({
  imports: [AuthModule],
  controllers: [RepairRequestsController],
  providers: [RepairRequestsService],
})
export class RepairRequestsModule {}
