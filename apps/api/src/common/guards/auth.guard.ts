import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AUTH_COOKIE, SessionPayloadSchema } from "@etp/auth";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[AUTH_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Authentication required.");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.BETTER_AUTH_SECRET ?? "replace-me",
      });

      request.user = SessionPayloadSchema.parse(payload);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid session.");
    }
  }
}
