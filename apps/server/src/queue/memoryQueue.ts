import PQueue from "p-queue";
import type { QueueJob, QueueProvider, WorkerHandler } from "./index";

export class MemoryQueue implements QueueProvider {
  private queue: PQueue;
  private handlers = new Map<string, WorkerHandler<unknown>>();

  constructor(concurrency = 1) {
    this.queue = new PQueue({ concurrency });
  }

  register<TPayload>(name: string, handler: WorkerHandler<TPayload>) {
    this.handlers.set(name, handler as WorkerHandler<unknown>);
  }

  async enqueue<TPayload>({ name, payload }: QueueJob<TPayload>): Promise<void> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`Handler not registered for job ${name}`);
    }
    await this.queue.add(async () => {
      await handler(payload as unknown);
    });
  }
}
