import type { Context } from '@deepseek-ai/cordis';

export declare const name: string;
export declare function apply(ctx: Context, config?: any): void;

export declare class AccountStore {
  constructor(options?: any);
  getAll(): any[];
  get(uid: string): any;
  getActive(): any;
  setActive(uid: string): boolean;
  upsert(account: any): any;
  delete(uid: string): boolean;
}

export declare class Scheduler {
  constructor(store: AccountStore, options?: any);
  acquire(account: any): boolean;
  release(account: any): void;
  recordSuccess(account: any): void;
  recordFailure(account: any, kind: string, message?: string): void;
  executeWithFailover(model: string, reqFn: (account: any) => Promise<any>): Promise<any>;
}

export declare class UpstreamClient {
  constructor(options?: any);
  chatStream(account: any, reqBody: any, signal?: any): Promise<any>;
  refreshToken(account: any): Promise<any>;
  fetchBalance(account: any): Promise<any>;
  fetchModels(account: any): Promise<any[]>;
}

export declare class LoopbackGateway {
  constructor(scheduler: Scheduler, client: UpstreamClient, ledger: any, options?: any);
  start(): Promise<number>;
  stop(): void;
  actualPort: number | null;
}
