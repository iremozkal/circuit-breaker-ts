import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as bodyparser from "body-parser";
import "reflect-metadata";
import { rateLimiter } from "./middlewares";
import MainRouter from "./routes/mainRouter";
import { APP_CONFIGS } from "./shared/envConfigs";

const app = express();

app.use(cors());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

export const getApp = async () => {
  try {
    app.use(
      `/${APP_CONFIGS.routeBase}/v${APP_CONFIGS.version}`,
      MainRouter.build()
    );
    return app;
  } catch (error) {
    console.error(`🐞 Error @app: ${(error as Error)?.message}`);
    process.exit(1);
  }
};
