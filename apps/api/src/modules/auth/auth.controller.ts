import { Body, Controller, Get, Inject, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto, ResetPasswordDto, SignInDto, SignUpDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("sign-up")
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) response: Response) {
    return { data: await this.authService.signUp(dto, response) };
  }

  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) response: Response) {
    return { data: await this.authService.signIn(dto, response) };
  }

  @Post("sign-out")
  async signOut(@Res({ passthrough: true }) response: Response) {
    return { data: this.authService.signOut(response) };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return { data: await this.authService.forgotPassword(dto) };
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return { data: await this.authService.resetPassword(dto) };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: unknown) {
    return { data: user };
  }
}
