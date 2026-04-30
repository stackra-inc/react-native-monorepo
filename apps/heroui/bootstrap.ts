import "reflect-metadata";

import { Application } from "@stackra/ts-container";
import { Facade } from "@stackra/ts-support";
import { AppModule } from "./app.module";

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
  console.log("[Bootstrap] Starting...");

  if (app) {
    console.log("[Bootstrap] Already bootstrapped, returning existing app");
    return app;
  }

  console.log("[Bootstrap] Creating Application from AppModule...");
  app = await Application.create(AppModule);
  console.log("[Bootstrap] Application created, setting Facade...");
  Facade.setApplication(app);
  console.log("[Bootstrap] Facade set. Bootstrap complete.");

  return app;
}
