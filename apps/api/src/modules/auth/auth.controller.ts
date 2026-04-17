import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from "./auth.dto";

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
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() request: Request) {
    return { data: await this.authService.forgotPassword(dto, { ip: this.getRequestIp(request) }) };
  }

  @Post("resend-verification")
  async resendVerification(@Body() dto: ResendVerificationEmailDto, @Req() request: Request) {
    return { data: await this.authService.resendVerificationEmail(dto, { ip: this.getRequestIp(request) }) };
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request) {
    return { data: await this.authService.resetPassword(dto, { ip: this.getRequestIp(request) }) };
  }

  @Post("verify-email")
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() request: Request) {
    return { data: await this.authService.verifyEmail(dto, { ip: this.getRequestIp(request) }) };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: unknown) {
    return { data: user };
  }

  private getRequestIp(request: Request): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0] || "unknown";
    }

    return request.ip || "unknown";
  }
}
