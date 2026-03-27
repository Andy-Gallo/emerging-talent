import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  AddApplicationNoteDto,
  CreateOrUpdateApplicationDto,
  UpdateApplicationStatusDto,
} from "./applications.dto";
import { ApplicationsService } from "./applications.service";

@Controller("applications")
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get("mine")
  async mine(@CurrentUser() user: { sub: string }) {
    return { data: await this.applicationsService.listMine(user.sub) };
  }

  @Post()
  async createOrUpdate(
    @CurrentUser() user: { sub: string },
    @Body() body: CreateOrUpdateApplicationDto,
  ) {
    return { data: await this.applicationsService.createOrUpdateDraft(user.sub, body) };
  }

  @Get(":applicationId")
  async detail(@CurrentUser() user: { sub: string }, @Param("applicationId") applicationId: string) {
    return { data: await this.applicationsService.getDetailForOwner(user.sub, applicationId) };
  }

  @Get("role/:roleId")
  async byRole(@CurrentUser() user: { sub: string }, @Param("roleId") roleId: string) {
    return { data: await this.applicationsService.listRoleApplications(user.sub, roleId) };
  }

  @Patch(":applicationId/status")
  async updateStatus(
    @CurrentUser() user: { sub: string },
    @Param("applicationId") applicationId: string,
    @Body() body: UpdateApplicationStatusDto,
  ) {
    return { data: await this.applicationsService.updateStatus(user.sub, applicationId, body.status) };
  }

  @Post(":applicationId/notes")
  async addNote(
    @CurrentUser() user: { sub: string },
    @Param("applicationId") applicationId: string,
    @Body() body: AddApplicationNoteDto,
  ) {
    return { data: await this.applicationsService.addInternalNote(user.sub, applicationId, body.note) };
  }
}
