/** Shared transform — prefer this in services; the pipe delegates to it. */
export function toKebabCase(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
