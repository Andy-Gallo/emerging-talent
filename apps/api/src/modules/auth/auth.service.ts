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
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { and, eq, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import * as bcrypt from "bcryptjs";
import type { Response } from "express";
import { MailService } from "../mail/mail.service";
import { AuthRateLimitService } from "./auth-rate-limit.service";
import { ForgotPasswordDto, ResendVerificationEmailDto, ResetPasswordDto, SignInDto, SignUpDto } from "./auth.dto";
import type { VerifyEmailDto } from "./auth.dto";

type AuthRequestContext = {
  ip: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(MailService) private readonly mailService: MailService,
    @Inject(AuthRateLimitService) private readonly authRateLimitService: AuthRateLimitService,
  ) {}

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

  private createOpaqueToken(): { rawToken: string; tokenHash: string } {
    const rawToken = randomBytes(32).toString("base64url");
    return { rawToken, tokenHash: this.hashToken(rawToken) };
  }

  private hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  private toPublicUser(user: typeof users.$inferSelect) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async signUp(dto: SignUpDto, response: Response) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.primaryEmail, normalizedEmail))
      .limit(1);

    if (existing) {
      throw new BadRequestException("Email is already registered.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await db
      .insert(users)
      .values({
        primaryEmail: normalizedEmail,
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

    const { rawToken: verificationToken, tokenHash: verificationTokenHash } = this.createOpaqueToken();
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      email: user.primaryEmail,
      tokenHash: verificationTokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verificationEmailQueued = await this.mailService.sendEmailVerificationEmail({
      to: user.primaryEmail,
      displayName: user.displayName,
      token: verificationToken,
    });

    if (!verificationEmailQueued) {
      this.logger.warn(`Verification email queueing failed for user "${user.id}".`);
    }

    const payload: SessionPayload = {
      sub: user.id,
      email: user.primaryEmail,
      displayName: user.displayName,
      role: user.globalRole as SessionPayload["role"],
    };

    this.setCookie(response, payload);

    return {
      user: this.toPublicUser(user),
      verificationEmailQueued,
    };
  }

  async signIn(dto: SignInDto, response: Response) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.primaryEmail, normalizedEmail))
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
      user: this.toPublicUser(user),
    };
  }

  signOut(response: Response) {
    response.clearCookie(AUTH_COOKIE, {
      path: "/",
    });
    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto, context: AuthRequestContext) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const now = new Date();
    const emailHash = this.hashToken(normalizedEmail);

    await this.authRateLimitService.consume({
      key: `auth:forgot-password:ip:${context.ip}`,
      limit: 20,
      windowSeconds: 60 * 60,
      message: "Too many password reset requests. Please try again later.",
    });

    await this.authRateLimitService.consume({
      key: `auth:forgot-password:email:${emailHash}`,
      limit: 5,
      windowSeconds: 60 * 60,
      message: "Too many password reset requests. Please try again later.",
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.primaryEmail, normalizedEmail))
      .limit(1);

    if (!user) {
      return { ok: true };
    }

    const { rawToken, tokenHash } = this.createOpaqueToken();

    await db.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now, updatedAt: now })
        .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

      await tx.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
    });

    const resetEmailQueued = await this.mailService.sendPasswordResetEmail({
      to: user.primaryEmail,
      displayName: user.displayName,
      token: rawToken,
    });

    if (!resetEmailQueued) {
      this.logger.warn(`Password reset email queueing failed for user "${user.id}".`);
    }

    return { ok: true };
  }

  async resendVerificationEmail(dto: ResendVerificationEmailDto, context: AuthRequestContext) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const now = new Date();
    const emailHash = this.hashToken(normalizedEmail);

    await this.authRateLimitService.consume({
      key: `auth:resend-verification:ip:${context.ip}`,
      limit: 20,
      windowSeconds: 60 * 60,
      message: "Too many verification email requests. Please try again later.",
    });

    await this.authRateLimitService.consume({
      key: `auth:resend-verification:email:${emailHash}`,
      limit: 5,
      windowSeconds: 60 * 60,
      message: "Too many verification email requests. Please try again later.",
    });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.primaryEmail, normalizedEmail))
      .limit(1);

    if (!user || user.emailVerifiedAt) {
      return { ok: true };
    }

    const { rawToken: verificationToken, tokenHash: verificationTokenHash } = this.createOpaqueToken();

    await db.transaction(async (tx) => {
      await tx
        .delete(emailVerificationTokens)
        .where(and(eq(emailVerificationTokens.userId, user.id), isNull(emailVerificationTokens.verifiedAt)));

      await tx.insert(emailVerificationTokens).values({
        userId: user.id,
        email: user.primaryEmail,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    const verificationEmailQueued = await this.mailService.sendEmailVerificationEmail({
      to: user.primaryEmail,
      displayName: user.displayName,
      token: verificationToken,
    });

    if (!verificationEmailQueued) {
      this.logger.warn(`Resend verification email queueing failed for user "${user.id}".`);
    }

    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto, context: AuthRequestContext) {
    const tokenHash = this.hashToken(dto.token);
    const now = new Date();

    await this.authRateLimitService.consume({
      key: `auth:reset-password:ip:${context.ip}`,
      limit: 20,
      windowSeconds: 60 * 60,
      message: "Too many password reset attempts. Please try again later.",
    });

    await this.authRateLimitService.consume({
      key: `auth:reset-password:token:${tokenHash}`,
      limit: 8,
      windowSeconds: 60 * 60,
      message: "Too many password reset attempts. Please try again later.",
    });

    const [tokenRow] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    if (!tokenRow) {
      throw new NotFoundException("Reset token not found.");
    }

    if (tokenRow.usedAt || tokenRow.expiresAt < new Date()) {
      throw new BadRequestException("Reset token is no longer valid.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, tokenRow.userId));

      // Invalidate all active reset tokens for this user after a successful reset.
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now, updatedAt: now })
        .where(and(eq(passwordResetTokens.userId, tokenRow.userId), isNull(passwordResetTokens.usedAt)));
    });

    return { ok: true };
  }

  async verifyEmail(dto: VerifyEmailDto, context: AuthRequestContext) {
    const tokenHash = this.hashToken(dto.token);
    const now = new Date();

    await this.authRateLimitService.consume({
      key: `auth:verify-email:ip:${context.ip}`,
      limit: 60,
      windowSeconds: 60 * 60,
      message: "Too many verification attempts. Please try again later.",
    });

    const [tokenRow] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1);

    if (!tokenRow) {
      throw new NotFoundException("Verification token not found.");
    }

    if (tokenRow.verifiedAt) {
      throw new BadRequestException("Email is already verified.");
    }

    if (tokenRow.expiresAt < now) {
      throw new BadRequestException("Verification token is no longer valid.");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ emailVerifiedAt: now, updatedAt: now })
        .where(eq(users.id, tokenRow.userId));

      await tx
        .update(emailVerificationTokens)
        .set({ verifiedAt: now, updatedAt: now })
        .where(eq(emailVerificationTokens.id, tokenRow.id));
    });

    return { ok: true };
  }
}
