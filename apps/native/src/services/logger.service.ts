import { Injectable } from "@stackra/ts-container";

@Injectable()
export class LoggerService {
  log(message: string, context?: string) {
    const prefix = context ? `[${context}]` : "[App]";
    console.log(`${prefix} ${message}`);
  }

  warn(message: string, context?: string) {
    const prefix = context ? `[${context}]` : "[App]";
    console.warn(`${prefix} ${message}`);
  }

  error(message: string, error?: unknown, context?: string) {
    const prefix = context ? `[${context}]` : "[App]";
    console.error(`${prefix} ${message}`, error);
  }
}
