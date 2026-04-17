import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import nodemailer from "nodemailer";

const connection = new IORedis(process.env.VALKEY_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

const emailWorker = new Worker(
  "email",
  async (job) => {
    const { to, subject, text, html } = job.data as {
      to: string;
      subject: string;
      text: string;
      html?: string;
    };

    await mailer.sendMail({
      from: process.env.EMAIL_FROM ?? "no-reply@example.local",
      to,
      subject,
      text,
      html,
    });
  },
  { connection },
);

const mediaWorker = new Worker(
  "media",
  async (job) => {
    console.log("Processing media job", job.id);
  },
  { connection },
);

const indexingWorker = new Worker(
  "indexing",
  async (job) => {
    console.log("Processing indexing job", job.id);
  },
  { connection },
);

const notificationsWorker = new Worker(
  "notifications",
  async (job) => {
    console.log("Processing notification job", job.id);
  },
  { connection },
);

const aiWorker = new Worker(
  "ai",
  async (job) => {
    console.log("Processing AI job", job.id);
  },
  { connection },
);

const shutdown = async () => {
  await Promise.all([
    emailWorker.close(),
    mediaWorker.close(),
    indexingWorker.close(),
    notificationsWorker.close(),
    aiWorker.close(),
    connection.quit(),
  ]);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Worker online.");
