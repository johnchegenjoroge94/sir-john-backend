import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RepairStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateStatusDto {
  @ApiProperty({ enum: RepairStatus })
  @IsEnum(RepairStatus)
  status: RepairStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
