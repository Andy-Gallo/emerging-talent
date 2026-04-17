import { HttpException, HttpStatus, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import IORedis from "ioredis";

@Injectable()
export class AuthRateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthRateLimitService.name);
  private readonly connection: IORedis;

  constructor() {
    this.connection = new IORedis(process.env.VALKEY_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }

  async onModuleDestroy() {
    await this.connection.quit();
  }

  async consume(input: {
    key: string;
    limit: number;
    windowSeconds: number;
    message: string;
  }): Promise<void> {
    try {
      const result = await this.connection
        .multi()
        .incr(input.key)
        .pttl(input.key)
        .exec();

      if (!result) {
        return;
      }

      const count = Number(result[0]?.[1] ?? 0);
      const ttlMs = Number(result[1]?.[1] ?? -2);

      if (ttlMs < 0) {
        await this.connection.pexpire(input.key, input.windowSeconds * 1000);
      }

      if (count > input.limit) {
        throw new HttpException(input.message, HttpStatus.TOO_MANY_REQUESTS);
      }
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Rate limiter unavailable for key "${input.key}": ${message}`);
    }
  }
}
