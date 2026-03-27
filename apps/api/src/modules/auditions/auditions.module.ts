import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import { AuditionsController } from "./auditions.controller";
import { AuditionsService } from "./auditions.service";

@Module({
  imports: [ProjectsModule],
  controllers: [AuditionsController],
  providers: [AuditionsService],
})
export class AuditionsModule {}
