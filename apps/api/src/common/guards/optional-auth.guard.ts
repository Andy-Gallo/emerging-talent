import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { jwtVerify } from "jose";
import { AUTH_COOKIE, SessionPayloadSchema } from "@etp/auth";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.[AUTH_COOKIE];

    if (!token) {
      return true;
    }

    try {
      const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET ?? "replace-me");
      const { payload } = await jwtVerify(token, secret);
      request.user = SessionPayloadSchema.parse(payload);
    } catch {
      request.user = undefined;
    }

    return true;
  }
}
