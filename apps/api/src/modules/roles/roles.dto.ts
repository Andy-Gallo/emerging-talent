import {
  IsArray,
  IsBoolean,
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

const ROLE_STATUSES = ["draft", "open", "paused", "closed"] as const;
const ROLE_QUESTION_INPUT_TYPES = ["text", "textarea", "url", "number"] as const;

export class RoleQuestionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(400)
  question!: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsEnum(ROLE_QUESTION_INPUT_TYPES)
  inputType?: (typeof ROLE_QUESTION_INPUT_TYPES)[number];
}

export class CreateRoleDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleType?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  compensationType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  compensationText?: string;

  @IsOptional()
  @IsDateString()
  deadlineAt?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsEnum(ROLE_STATUSES)
  status?: (typeof ROLE_STATUSES)[number];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleQuestionDto)
  roleQuestions?: RoleQuestionDto[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsEnum(ROLE_STATUSES)
  status?: (typeof ROLE_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  compensationType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  compensationText?: string;

  @IsOptional()
  @IsDateString()
  deadlineAt?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;
}
