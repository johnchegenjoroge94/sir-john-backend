import "dotenv/config"; // must load .env before any module reads process.env
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.use(helmet());

  const origins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const swaggerOn = process.env.NODE_ENV !== "production" || process.env.SWAGGER_ENABLED === "true";
  if (swaggerOn) {
    const config = new DocumentBuilder()
      .setTitle("Sir John Phones API")
      .setDescription("REST API for repair requests, services, accessories and administration.")
      .setVersion("0.1")
      .addBearerAuth()
      .build();
    SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api${swaggerOn ? " (docs: /api/docs)" : ""}`);
}

bootstrap();
