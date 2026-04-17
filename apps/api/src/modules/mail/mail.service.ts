import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";

type EmailJobData = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type PasswordResetEmailInput = {
  to: string;
  displayName: string;
  token: string;
};

type VerificationEmailInput = {
  to: string;
  displayName: string;
  token: string;
};

@Injectable()
export class MailService implements OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly connection: IORedis;
  private readonly emailQueue: Queue<EmailJobData>;

  constructor() {
    this.connection = new IORedis(process.env.VALKEY_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });

    this.emailQueue = new Queue<EmailJobData>("email", {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    });
  }

  async onModuleDestroy() {
    await Promise.all([this.emailQueue.close(), this.connection.quit()]);
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<boolean> {
    const resetUrl = this.createAppUrl("/reset-password", input.token);
    const subject = "Reset your Emerging Talent password";
    const text = [
      `Hi ${input.displayName},`,
      "",
      "We received a request to reset your password.",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 2 hours. If you did not request this, you can ignore this email.",
    ].join("\n");

    const html = [
      `<p>Hi ${this.escapeHtml(input.displayName)},</p>`,
      "<p>We received a request to reset your password.</p>",
      `<p><a href="${this.escapeHtml(resetUrl)}">Reset your password</a></p>`,
      "<p>This link expires in 2 hours. If you did not request this, you can ignore this email.</p>",
    ].join("");

    return this.enqueueEmail("password-reset", { to: input.to, subject, text, html });
  }

  async sendEmailVerificationEmail(input: VerificationEmailInput): Promise<boolean> {
    const verifyUrl = this.createAppUrl("/verify", input.token);
    const subject = "Verify your Emerging Talent email";
    const text = [
      `Hi ${input.displayName},`,
      "",
      "Thanks for joining Emerging Talent.",
      `Verify your email: ${verifyUrl}`,
      "",
      "This link expires in 24 hours.",
    ].join("\n");

    const html = [
      `<p>Hi ${this.escapeHtml(input.displayName)},</p>`,
      "<p>Thanks for joining Emerging Talent.</p>",
      `<p><a href="${this.escapeHtml(verifyUrl)}">Verify your email</a></p>`,
      "<p>This link expires in 24 hours.</p>",
    ].join("");

    return this.enqueueEmail("email-verification", { to: input.to, subject, text, html });
  }

  private async enqueueEmail(jobName: string, data: EmailJobData): Promise<boolean> {
    try {
      await this.emailQueue.add(jobName, data);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to queue "${jobName}" email: ${message}`);
      return false;
    }
  }

  private createAppUrl(pathname: string, token: string): string {
    const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const url = new URL(pathname, appBaseUrl);
    url.searchParams.set("token", token);
    return url.toString();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}
