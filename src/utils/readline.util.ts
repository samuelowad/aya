import { createReadStream } from 'fs';
import { join } from 'path';
import LineByLineReader = require('line-by-line');
import { split } from 'lodash';

export function readText(path: string) {
  const [, , , filename] = split(path, '/');
  return { read: new LineByLineReader(join(process.cwd(), path)), filename };
}
