import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthRateLimitService } from "./auth-rate-limit.service";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRateLimitService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
