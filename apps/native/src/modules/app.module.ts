import { Module, Global } from "@stackra/ts-container";
import { LoggerService } from "../services/logger.service";

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
