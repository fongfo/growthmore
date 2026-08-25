import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { demoLinkedBankAccount, demoMockSession, demoTenant } from "@growthmore/shared";

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
  app.post("/api/auth/mock-login", (_request, response) => {
    response.status(201).json({
      session: demoMockSession
    });
  });

  app.get("/api/auth/session", (_request, response) => {
    response.json({
      session: demoMockSession
    });
  });

  app.get("/api/bank-accounts/current", (_request, response) => {
    response.json({
      account: demoLinkedBankAccount
    });
  });

  return app;
}
