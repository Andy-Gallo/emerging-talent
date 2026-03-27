import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { BillingController } from "./billing.controller";

@Module({
  imports: [OrganizationsModule],
  controllers: [BillingController],
})
export class BillingModule {}
