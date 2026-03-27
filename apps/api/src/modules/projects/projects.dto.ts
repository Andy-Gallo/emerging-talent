import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const PROJECT_VISIBILITY_SCOPES = ["campus_only", "selected_institutions", "public_network"] as const;
export type ProjectVisibilityScope = (typeof PROJECT_VISIBILITY_SCOPES)[number];

export class CreateProjectDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(400)
  summary!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsEnum(PROJECT_VISIBILITY_SCOPES)
  visibilityScope!: ProjectVisibilityScope;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  selectedInstitutionIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(240)
  locationText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  compensationSummary?: string;

  @IsOptional()
  @IsDateString()
  applicationDeadlineAt?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(400)
  summary?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsEnum(PROJECT_VISIBILITY_SCOPES)
  visibilityScope?: ProjectVisibilityScope;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  selectedInstitutionIds?: string[];

  @IsOptional()
  @IsDateString()
  applicationDeadlineAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  status?: string;
}
