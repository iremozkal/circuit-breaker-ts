import * as dotenv from "dotenv";
dotenv.config();

function checkEnv(env: string): string {
  const value = process.env[env];
  if (!value) {
    throw new Error(`Env: ${env} not found or empty!`);
  }
  return value;
}

export const APP_CONFIGS = {
  port: parseInt(checkEnv("PORT")),
  routeBase: checkEnv("ROUTE_BASE"),
  version: parseInt(checkEnv("VERSION")),
};

export const CIRCUIT_BREAKER_CONFIGS = {
  failureThreshold: parseInt(checkEnv("CIRCUIT_BREAKER_FAILURE_THRESHOLD")),
  successThreshold: parseInt(checkEnv("CIRCUIT_BREAKER_SUCCESS_THRESHOLD")),
  timeout: parseInt(checkEnv("CIRCUIT_BREAKER_TIMEOUT")),
};

export const TODO_SERVICE_CONFIGS = {
  baseUrl: checkEnv("TODO_SERVICE_BASE_URL"),
};
