import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE_SECONDS, SessionPayload } from "@etp/auth";
import { db } from "@etp/db";
import {
  emailVerificationTokens,
  passwordResetTokens,
  userAffiliations,
  users,
} from "@etp/db";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import * as bcrypt from "bcryptjs";
import type { Response } from "express";
import { ForgotPasswordDto, ResetPasswordDto, SignInDto, SignUpDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  private signSession(payload: SessionPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.BETTER_AUTH_SECRET ?? "replace-me",
      expiresIn: `${AUTH_COOKIE_MAX_AGE_SECONDS}s`,
    });
  }

  private setCookie(response: Response, payload: SessionPayload): void {
    response.cookie(AUTH_COOKIE, this.signSession(payload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS * 1000,
      path: "/",
    });
  }

  async signUp(dto: SignUpDto, response: Response) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.primaryEmail, dto.email.toLowerCase()))
      .limit(1);

    if (existing) {
      throw new BadRequestException("Email is already registered.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await db
      .insert(users)
      .values({
        primaryEmail: dto.email.toLowerCase(),
        displayName: dto.displayName,
        passwordHash,
        accountType: "student",
        globalRole: "user",
        isActive: true,
      })
      .returning();

    if (dto.institutionId) {
      await db.insert(userAffiliations).values({
        userId: user.id,
        institutionId: dto.institutionId,
        graduationYear: dto.graduationYear,
        verificationMethod: "manual",
        status: "pending",
        isPrimary: true,
      });
    }

    const verificationToken = randomUUID();
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      email: user.primaryEmail,
      tokenHash: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const payload: SessionPayload = {
      sub: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      role: user.globalRole as SessionPayload["role"],
    };

    this.setCookie(response, payload);

    return {
      user,
      verificationToken,
    };
  }

  async signIn(dto: SignInDto, response: Response) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.primaryEmail, dto.email.toLowerCase()))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const payload: SessionPayload = {
      sub: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      role: user.globalRole as SessionPayload["role"],
    };

    this.setCookie(response, payload);

    return {
      user,
    };
  }

  signOut(response: Response) {
    response.clearCookie(AUTH_COOKIE, {
      path: "/",
    });
    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.primaryEmail, dto.email.toLowerCase()))
      .limit(1);

    if (!user) {
      return { ok: true };
    }

    const token = randomUUID();

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: token,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    return { ok: true, resetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const [tokenRow] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, dto.token))
      .limit(1);

    if (!tokenRow) {
      throw new NotFoundException("Reset token not found.");
    }

    if (tokenRow.usedAt || tokenRow.expiresAt < new Date()) {
      throw new BadRequestException("Reset token is no longer valid.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, tokenRow.userId));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenRow.id));

    return { ok: true };
  }
}
