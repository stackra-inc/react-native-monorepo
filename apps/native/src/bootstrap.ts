import "reflect-metadata";

import { Application } from "@stackra/ts-container";
import { Facade } from "@stackra/ts-support";
import { AppModule } from "./modules/app.module";

let app: Application | null = null;

/**
 * Bootstrap the DI container.
 *
 * Call once at app startup before rendering. Subsequent calls return
 * the existing application instance.
 *
 * @returns The bootstrapped Application instance
 */
export async function bootstrap(): Promise<Application> {
  if (app) {
    return app;
  }

  app = await Application.create(AppModule);
  Facade.setApplication(app);

  return app;
}
