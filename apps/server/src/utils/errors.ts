export class IntegrationError extends Error {
  constructor(message: string, public integration: string, public cause?: unknown) {
    super(message);
    this.name = "IntegrationError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
