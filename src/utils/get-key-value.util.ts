import { split } from 'lodash';

export function getKeyValue(line: string, separator: string): string[] {
  return split(line, separator);
}
