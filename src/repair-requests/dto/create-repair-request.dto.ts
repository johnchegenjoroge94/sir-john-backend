import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContactMethod, DeviceType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class CreateRepairRequestDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerName: string;

  @ApiProperty({ example: "0712345678" })
  @Transform(trim)
  @Matches(/^(?:\+?254|0)?[17]\d{8}$/, { message: "Enter a valid Kenyan phone number." })
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiProperty({ enum: DeviceType })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  brandModel: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  problem: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  requestedService: string;

  @ApiProperty({ enum: ContactMethod })
  @IsEnum(ContactMethod)
  preferredContact: ContactMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  notes?: string;
}
