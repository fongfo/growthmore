import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { demoTenant } from "@growthmore/shared";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      service: "growthmore-api",
      tenant: demoTenant.slug
    });
  });

  app.get("/api/tenant/current", (_request, response) => {
    response.json({
      tenant: demoTenant
    });
  });

  return app;
}

