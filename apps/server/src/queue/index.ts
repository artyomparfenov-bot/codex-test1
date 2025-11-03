export type QueueJob<TPayload> = {
  name: string;
  payload: TPayload;
};

export interface QueueProvider {
  enqueue<TPayload>(job: QueueJob<TPayload>): Promise<void>;
}

export type WorkerHandler<TPayload> = (payload: TPayload) => Promise<void>;

export interface QueueWorker {
  start(): void;
  stop(): void;
}

export { MemoryQueue } from "./memoryQueue";
