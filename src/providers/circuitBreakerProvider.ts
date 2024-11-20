import { ICircuitBreakerOptions } from "../interfaces";
import { CircuitBreaker } from "../utils/circuitBreaker";

class CircuitBreakerProvider<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static instance: CircuitBreakerProvider<any> | null = null;
  private circuitBreakers: Map<string, CircuitBreaker<T>> = new Map();

  private constructor() {}

  public static getInstance<T>(): CircuitBreakerProvider<T> {
    if (!this.instance) {
      this.instance = new CircuitBreakerProvider();
    }
    return this.instance;
  }

  public getCircuitBreaker(
    baseUrl: string,
    options?: Partial<ICircuitBreakerOptions>
  ): CircuitBreaker<T> {
    const normalizedUrl = baseUrl.toLowerCase();
    if (!this.circuitBreakers.has(normalizedUrl)) {
      const newCircuitBreaker = new CircuitBreaker<T>(baseUrl, options);
      this.circuitBreakers.set(normalizedUrl, newCircuitBreaker);
    }
    return this.circuitBreakers.get(normalizedUrl)!;
  }
}

export const circuitBreakerProvider = CircuitBreakerProvider.getInstance();
