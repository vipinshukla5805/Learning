import { Pipe, PipeTransform } from '@angular/core';
import { toKebabCase } from './to-kebab-case';

/**
 * Phase 1B · 1B.6 — Custom pure pipe
 * @see https://angular.dev/guide/templates/pipes
 */
@Pipe({ name: 'kebabCase' })
export class KebabCasePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return toKebabCase(value);
  }
}
