import { Module } from "@nestjs/common";
import { ApplicationsModule } from "../applications/applications.module";
import { AuditionsController } from "./auditions.controller";
import { AuditionsService } from "./auditions.service";

@Module({
  imports: [ApplicationsModule],
  controllers: [AuditionsController],
  providers: [AuditionsService],
})
export class AuditionsModule {}
