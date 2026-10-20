import * as io from "node:fs/promises";
import * as fs from "node:fs";
import * as path from "node:path";
import { createNativeInteractionServices } from "../interaction/native-interaction-services.js";
import type { HarnessSession } from "../sessions/session.js";

const utilities = createNativeInteractionServices({
  modules: { 16928: path },
}).PlanModeUtils;
/** Existing explicit-directory API; original naming implementation is retained. */
export class PlanModeUtils {
  static generateUniquePlanFileName(): string {
    return utilities.generateUniquePlanFileName();
  }
  static generatePlanFilePath(directory: string): string {
    return path.join(directory, this.generateUniquePlanFileName());
  }
}
/** Original module 78621, with an explicit caller-owned plans directory and IO. */
export class PlanStorageService {
  readonly original: any;
  constructor(
    plansDirectory: string,
    logger: any = { debug() {}, warn() {}, error() {} },
  ) {
    const native = createNativeInteractionServices({
      modules: { 16928: path, 91943: io, 79896: fs },
      getPlansDir: () => plansDirectory,
    });
    this.original = new native.PlanStorageServiceImpl();
    this.original.logger = logger;
  }
  initializePlanFilePath(session: HarnessSession): string {
    return this.original.initializePlanFilePath(session);
  }
  getPlanFilePath(session: HarnessSession): string | undefined {
    return this.original.getPlanFilePath(session);
  }
  write(session: HarnessSession, content: string): Promise<void> {
    return this.original.write(session, content);
  }
  read(session: HarnessSession): Promise<string | undefined> {
    return this.original.read(session);
  }
  syncRead(session: HarnessSession): string | undefined {
    return this.original.syncRead(session);
  }
  exists(session: HarnessSession): Promise<boolean> {
    return this.original.exists(session);
  }
}
