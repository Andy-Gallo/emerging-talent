import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

const AUDITION_MODES = ["live", "self_tape"] as const;

export class AuditionSlotDto {
  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  locationText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  meetingUrl?: string;
}

export class RequestAuditionDto {
  @IsUUID()
  applicationId!: string;

  @IsEnum(AUDITION_MODES)
  mode!: (typeof AUDITION_MODES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditionSlotDto)
  slots?: AuditionSlotDto[];
}

export class SubmitAuditionDto {
  @IsUUID()
  auditionRequestId!: string;

  @IsOptional()
  @IsUUID()
  slotId?: string;

  @IsOptional()
  @IsUUID()
  selfTapeMediaAssetId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  note?: string;
}
