import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequestAuditionDto, SubmitAuditionDto } from "./auditions.dto";
import { AuditionsService } from "./auditions.service";

@Controller("auditions")
@UseGuards(AuthGuard)
export class AuditionsController {
  constructor(@Inject(AuditionsService) private readonly auditionsService: AuditionsService) {}

  @Get()
  async list(@CurrentUser() user: { sub: string }) {
    return { data: await this.auditionsService.listForUser(user.sub) };
  }

  @Post("request")
  async request(
    @CurrentUser() user: { sub: string },
    @Body() body: RequestAuditionDto,
  ) {
    return { data: await this.auditionsService.request(user.sub, body) };
  }

  @Post("submit")
  async submit(
    @CurrentUser() user: { sub: string },
    @Body() body: SubmitAuditionDto,
  ) {
    return { data: await this.auditionsService.submit(user.sub, body) };
  }
}
