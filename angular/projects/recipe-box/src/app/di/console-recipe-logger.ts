import { Injectable } from '@angular/core';
import { RecipeLogger } from './tokens';

/** 3.2 / 3.3 — `useClass` target for RecipeLogger. */
@Injectable()
export class ConsoleRecipeLogger extends RecipeLogger {
  private readonly lines: string[] = [];

  info(message: string): void {
    const line = `[rb:info] ${message}`;
    this.lines.push(line);
    console.info(line);
  }

  warn(message: string): void {
    const line = `[rb:warn] ${message}`;
    this.lines.push(line);
    console.warn(line);
  }

  /** Demo / debugging — last N log lines. */
  snapshot(limit = 5): string[] {
    return this.lines.slice(-limit);
  }
}
