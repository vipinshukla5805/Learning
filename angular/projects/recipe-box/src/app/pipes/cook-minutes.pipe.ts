import { Pipe, PipeTransform } from '@angular/core';

/**
 * Phase 1B · 1B.6 — Custom pipe with parameters
 * Usage: `{{ minutes | cookMinutes }}` · `{{ minutes | cookMinutes:'short' }}`
 */
@Pipe({ name: 'cookMinutes' })
export class CookMinutesPipe implements PipeTransform {
  transform(value: number | null | undefined, format: 'long' | 'short' = 'long'): string {
    const m = value ?? 0;
    if (format === 'short') {
      return `${m}m`;
    }
    if (m === 1) {
      return '1 minute';
    }
    return `${m} minutes`;
  }
}
