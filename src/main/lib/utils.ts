import fs from 'fs';
import { optionsPath } from "./constants";

export interface Options {
  drivers: Driver[]
}

export function getOptions(): Options {
  return JSON.parse(
    fs.readFileSync(optionsPath(), { encoding: 'utf-8' })
  );
}

export function writeOptions(options: Options) {
  return fs.writeFileSync(optionsPath(), JSON.stringify(options));
}

export function preparedSqlName(s: string) { return s.replace(/\'/g, "''"); }

