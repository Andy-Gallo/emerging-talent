import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "in_review",
  "shortlisted",
  "audition_requested",
  "audition_completed",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export class ApplicationAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  answer!: string;
}

export class CreateOrUpdateApplicationDto {
  @IsUUID()
  roleId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationAnswerDto)
  answers?: ApplicationAnswerDto[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  mediaAssetIds?: string[];

  @IsOptional()
  @IsBoolean()
  submit?: boolean;
}

export class UpdateApplicationStatusDto {
  @IsEnum(APPLICATION_STATUSES)
  status!: (typeof APPLICATION_STATUSES)[number];
}

export class AddApplicationNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  note!: string;
}
