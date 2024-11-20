import axios, { AxiosRequestConfig } from "axios";
import { CIRCUIT_BREAKER_CONFIGS } from "../shared/envConfigs";
import { CircuitBreakerStateEnum } from "../shared/enums";
import { ICircuitBreakerOptions } from "../interfaces";
import { ApplicationError } from "../shared/errors";

/**
 * CircuitBreaker class manages the state of a circuit breaker for an HTTP request.
 * It supports automatic retries, transitioning between states (CLOSED, HALF_OPEN, OPEN),
 * and manages failures by retrying the request a configurable number of times before opening the circuit.
 */
export class CircuitBreaker<T> {
  private baseUrl: string;
  private state: CircuitBreakerStateEnum = CircuitBreakerStateEnum.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;
  private retryDelay: number = 1000;

  constructor(baseUrl: string, options?: Partial<ICircuitBreakerOptions>) {
    this.baseUrl = baseUrl;
    this.failureThreshold =
      options?.failureThreshold ?? CIRCUIT_BREAKER_CONFIGS.failureThreshold;
    this.successThreshold =
      options?.successThreshold ?? CIRCUIT_BREAKER_CONFIGS.successThreshold;
    this.timeout = options?.timeout ?? CIRCUIT_BREAKER_CONFIGS.timeout;
  }

  public async exec<R = T>(requestConfig: AxiosRequestConfig): Promise<R> {
    if (this.state === CircuitBreakerStateEnum.OPEN && !this.isReadyToRetry()) {
      this.throwCircuitOpenError();
    }

    let lastError: string | undefined;
    for (let attempt = 0; attempt < this.failureThreshold; attempt++) {
      try {
        requestConfig.baseURL = this.baseUrl;
        const response = await axios(requestConfig);

        if (response.status >= 200 && response.status < 300) {
          return this.handleSuccess(response.data);
        }

        lastError = `Failed Status: ${response.status} from ${requestConfig.url}`;
        await this.handleFailure(lastError);
      } catch (error) {
        lastError = this.extractErrorMessage(error);
        await this.handleFailure(lastError);
      }

      await this.waitBeforeRetry();
    }

    throw new Error(lastError || "Failed to execute request");
  }

  private isReadyToRetry(): boolean {
    if (this.nextAttempt <= Date.now()) {
      this.state = CircuitBreakerStateEnum.HALF_OPEN;
      this.log({
        message: `State transitioned to ${CircuitBreakerStateEnum.HALF_OPEN}`,
      });
      return true;
    }
    return false;
  }

  private throwCircuitOpenError(): never {
    const timeLeft = Math.round((this.nextAttempt - Date.now()) / 1000);
    const errorMessage = `Circuit is open. No requests allowed. Retry in ${timeLeft} seconds.`;
    console.error(`Error @CircuitBreaker: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  private handleSuccess<R = T>(data?: R): R {
    this.failureCount = 0;
    if (this.state === CircuitBreakerStateEnum.HALF_OPEN) {
      this.incrementSuccessCount();
    }

    if (!data) {
      this.log({ message: "Request successful, but no content returned" });
      throw new ApplicationError("No data found", 404);
    }

    this.log({ message: "Request successful. Data received." });
    return data;
  }

  private async handleFailure(error: string): Promise<void> {
    this.failureCount++;
    this.log({ message: `Request failed. Error details: ${error}` });
    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit();
    }
  }

  private async waitBeforeRetry(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
  }

  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ?? error.message ?? "Unknown Axios error"
      );
    } else if (error instanceof Error) {
      return error.message;
    }
    return "UnknownError";
  }

  private incrementSuccessCount(): void {
    this.successCount++;
    if (this.successCount >= this.successThreshold) {
      this.closeCircuit();
    }
  }

  private openCircuit(): void {
    this.state = CircuitBreakerStateEnum.OPEN;
    this.nextAttempt = Date.now() + this.timeout;
    this.log({
      message: `State transitioned to ${CircuitBreakerStateEnum.OPEN}`,
    });
  }

  private closeCircuit(): void {
    this.state = CircuitBreakerStateEnum.CLOSED;
    this.successCount = 0;
    this.log({
      message: "Circuit successfully closed. Service is healthy again.",
    });
  }

  private log(additionalInfo?: object): void {
    console.table({
      timestamp: new Date().toISOString(),
      successes: this.successCount,
      failures: this.failureCount,
      state: this.state,
      ...additionalInfo,
    });
  }
}
