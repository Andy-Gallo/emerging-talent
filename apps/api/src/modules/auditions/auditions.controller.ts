import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AuditionsService } from "./auditions.service";

@Controller("auditions")
@UseGuards(AuthGuard)
export class AuditionsController {
  constructor(private readonly auditionsService: AuditionsService) {}

  @Get()
  async list(@CurrentUser() user: { sub: string }) {
    return { data: await this.auditionsService.listForUser(user.sub) };
  }

  @Post("request")
  async request(
    @CurrentUser() user: { sub: string },
    @Body()
    body: {
      applicationId: string;
      mode: "live" | "self_tape";
      message?: string;
      dueAt?: string;
      slots?: Array<{ startsAt: string; endsAt: string; locationText?: string; meetingUrl?: string }>;
    },
  ) {
    return { data: await this.auditionsService.request(user.sub, body) };
  }

  @Post("submit")
  async submit(
    @CurrentUser() user: { sub: string },
    @Body() body: { auditionRequestId: string; slotId?: string; selfTapeMediaAssetId?: string; note?: string },
  ) {
    return { data: await this.auditionsService.submit(user.sub, body) };
  }
}
