import { RateLimitError } from "./errors";

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private capacity: number, private refillPerSecond: number) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  take(tokenCost = 1) {
    this.refill();
    if (this.tokens < tokenCost) {
      throw new RateLimitError("Превышен лимит запросов");
    }
    this.tokens -= tokenCost;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    if (elapsed <= 0) return;
    const refillAmount = elapsed * this.refillPerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + refillAmount);
    this.lastRefill = now;
  }
}
