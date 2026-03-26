import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import { RolesController } from "./roles.controller";

@Module({
  imports: [ProjectsModule],
  controllers: [RolesController],
})
export class RolesModule {}
