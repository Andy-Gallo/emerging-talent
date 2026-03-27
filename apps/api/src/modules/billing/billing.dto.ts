import { IsEnum, IsUUID } from "class-validator";

const BILLING_OWNER_TYPES = ["user", "organization"] as const;

export class CheckoutDto {
  @IsEnum(BILLING_OWNER_TYPES)
  ownerType!: (typeof BILLING_OWNER_TYPES)[number];

  @IsUUID()
  ownerId!: string;

  @IsUUID()
  planId!: string;
}
