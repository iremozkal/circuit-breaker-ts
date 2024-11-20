export enum CircuitBreakerStateEnum {
  CLOSED = "CLOSED", // All requests allowed
  HALF_OPEN = "HALF_OPEN", // Limited requests allowed to test the service
  OPEN = "OPEN", // No requests allowed
}
